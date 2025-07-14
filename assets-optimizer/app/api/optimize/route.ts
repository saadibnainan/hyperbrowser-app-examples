import { NextRequest } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import sharp from 'sharp';
// @ts-ignore
import subsetFont from 'subset-font';
import ffmpeg from 'fluent-ffmpeg';
import archiver from 'archiver';
import { scrape } from '@/lib/hyper';
import { generateReport } from '@/lib/report';

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return new Response('Missing URL', { status: 400 });

  require('dotenv').config();

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      processAssets(url, controller, encoder);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function processAssets(url: string, controller: ReadableStreamDefaultController, encoder: TextEncoder) {
  try {
    const send = (msg: string) => {
      controller.enqueue(encoder.encode(`data: ${msg}\n\n`));
    };

    send('Starting asset extraction...');
    
    const { html, css, assets } = await scrape(url);
    
    send(`Found ${assets.length} assets to optimize`);

    let totalOrig = 0;
    let totalOpt = 0;
    let table: any[] = [];
    let optimizedAssets: any[] = [];

    for (const asset of assets) {
      totalOrig += asset.size;
      send(`[GET] ${asset.url} ${(asset.size / 1024).toFixed(2)} KB`);

      const opt = await optimize(asset, html, css);
      optimizedAssets.push(opt);
      totalOpt += opt.size;
      table.push({
        asset: asset.url,
        original: asset.size,
        optimized: opt.size,
        saved: asset.size - opt.size,
      });
      send(`→ ${(opt.size / 1024).toFixed(2)} KB ✓`);
    }

    send('Patching HTML...');
    const patchedHtml = patchHtml(html, assets, optimizedAssets);

    send('Creating ZIP bundle...');
    const zipBuffer = await createZip(patchedHtml, css, optimizedAssets);
    const base64 = zipBuffer.toString('base64');

    const report = generateReport(totalOrig, totalOpt, table);
    send(JSON.stringify({ ...report, zip: base64 }));

    controller.close();
  } catch (error) {
    controller.enqueue(encoder.encode(`data: Error: ${error}\n\n`));
    controller.close();
  }
}

async function optimize(asset: any, html: string, css: string) {
  const { buffer, type, url } = asset;
  const ext = path.extname(url);
  const basename = path.basename(url, ext);

  if (type.startsWith('image/')) {
    try {
      const optBuffer = await sharp(buffer).avif({ quality: 50 }).toBuffer();
      return { buffer: optBuffer, size: optBuffer.length, type: 'image/avif', filename: `${basename}.avif` };
    } catch (error) {
      console.error(`Failed to optimize image ${url}:`, error);
      // Return original buffer if optimization fails
      return { buffer, size: buffer.length, type, filename: path.basename(url) };
    }
  } else if (type === 'font/ttf' || type === 'font/otf') {
    try {
      const text = cheerio.load(html).root().text();
      const optBuffer = await subsetFont(buffer, text, { targetFormat: 'woff2' });
      return { buffer: optBuffer, size: optBuffer.length, type: 'font/woff2', filename: `${basename}.woff2` };
    } catch (error) {
      console.error(`Failed to subset font ${url}:`, error);
      // Return original buffer if font subsetting fails
      return { buffer, size: buffer.length, type, filename: path.basename(url) };
    }
  } else if (type.startsWith('video/')) {
    try {
      const tempVideo = `/tmp/${basename}-${Date.now()}${ext}`;
      const tempPoster = `/tmp/poster-${basename}-${Date.now()}.jpg`;
      await fs.writeFile(tempVideo, buffer);
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempVideo)
          .output(tempPoster)
          .seekInput(0)
          .frames(1)
          .on('end', () => resolve())
          .on('error', reject)
          .run();
      });
      const posterBuffer = await fs.readFile(tempPoster);
      const optPoster = await sharp(posterBuffer).jpeg({ quality: 80 }).toBuffer();
      await fs.unlink(tempVideo);
      await fs.unlink(tempPoster);
      return {
        buffer,
        size: buffer.length,
        type,
        filename: `${basename}${ext}`,
        poster: { buffer: optPoster, size: optPoster.length, type: 'image/jpeg', filename: `poster-${basename}.jpg` }
      };
    } catch (error) {
      console.error(`Failed to process video ${url}:`, error);
      // Return original buffer if video processing fails
      return { buffer, size: buffer.length, type, filename: path.basename(url) };
    }
  } else {
    return { buffer, size: buffer.length, type, filename: path.basename(url) };
  }
}

function patchHtml(html: string, assets: any[], optimizedAssets: any[]) {
  const $ = cheerio.load(html);
  assets.forEach((asset, i) => {
    const opt = optimizedAssets[i];
    const selector = asset.type.startsWith('image/') ? `img[src="${asset.url}"]` :
                    asset.type.startsWith('video/') ? `video[src="${asset.url}"]` :
                    `link[href="${asset.url}"]`; // for fonts, assume <link>
    $(selector).attr('src', `assets/${opt.filename}`) || $(selector).attr('href', `assets/${opt.filename}`);
    if (opt.poster) {
      $(`video[src="${asset.url}"]`).attr('poster', `assets/${opt.poster.filename}`);
    }
  });
  return $.html();
}

async function createZip(patchedHtml: string, css: string, optimizedAssets: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    const archive = archiver('zip');
    
    archive.on('data', (chunk) => buffers.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(buffers)));
    archive.on('error', reject);
    
    archive.append(patchedHtml, { name: 'index.html' });
    archive.append(css, { name: 'styles.css' });
    
    optimizedAssets.forEach((opt) => {
      archive.append(opt.buffer, { name: `assets/${opt.filename}` });
      if (opt.poster) {
        archive.append(opt.poster.buffer, { name: `assets/${opt.poster.filename}` });
      }
    });
    
    archive.finalize();
  });
} 