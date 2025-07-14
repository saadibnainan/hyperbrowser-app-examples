import { Hyperbrowser } from '@hyperbrowser/sdk';
import * as cheerio from 'cheerio';

if (!process.env.HYPERBROWSER_API_KEY) {
  throw new Error('HYPERBROWSER_API_KEY environment variable is required. Get your API key from https://hyperbrowser.ai and add it to your .env.local file.');
}

export async function scrape(url: string) {
  const hb = new Hyperbrowser({
    apiKey: process.env.HYPERBROWSER_API_KEY,
  });

  try {
    // Scrape the webpage to get HTML content
    const scrapeResult = await hb.scrape.startAndWait({
      url,
      scrapeOptions: {
        formats: ['html'],
        onlyMainContent: false, // We need the full page to get all assets
        timeout: 30000,
        waitFor: 3000, // Wait for assets to load
      },
      sessionOptions: {
        useStealth: true,
        acceptCookies: true,
      }
    });

    if (!scrapeResult.data?.html) {
      throw new Error('Failed to extract HTML content from the webpage');
    }

    const html = scrapeResult.data.html;
    const $ = cheerio.load(html);

    // Extract CSS content
    let css = '';
    $('style').each((_, el) => {
      css += $(el).html() + '\n';
    });

    // Extract assets from the HTML
    const assets = await extractAssets($, url);

    return {
      html,
      css,
      assets
    };

  } catch (error) {
    console.error('Error scraping with Hyperbrowser:', error);
    throw error;
  }
}

async function extractAssets($: cheerio.Root, baseUrl: string) {
  const assets: Array<{
    url: string;
    type: string;
    buffer: Buffer;
    size: number;
  }> = [];

  // Helper function to resolve relative URLs
  const resolveUrl = (url: string) => {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  };

  // Extract images
  const imageSelectors = ['img[src]', 'source[srcset]', 'link[rel="icon"]', 'link[rel="apple-touch-icon"]'];
  for (const selector of imageSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href');
      if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
        const fullUrl = resolveUrl(src);
        if (fullUrl.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
          assets.push({
            url: fullUrl,
            type: getImageMimeType(fullUrl),
            buffer: Buffer.alloc(0), // Will be filled by downloadAsset
            size: 0
          });
        }
      }
    });
  }

  // Extract CSS files
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('data:')) {
      const fullUrl = resolveUrl(href);
      assets.push({
        url: fullUrl,
        type: 'text/css',
        buffer: Buffer.alloc(0),
        size: 0
      });
    }
  });

  // Extract JavaScript files
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:') && !src.startsWith('blob:')) {
      const fullUrl = resolveUrl(src);
      assets.push({
        url: fullUrl,
        type: 'application/javascript',
        buffer: Buffer.alloc(0),
        size: 0
      });
    }
  });

  // Extract fonts
  $('link[rel="preload"][as="font"], link[href*=".woff"], link[href*=".ttf"], link[href*=".otf"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('data:')) {
      const fullUrl = resolveUrl(href);
      assets.push({
        url: fullUrl,
        type: getFontMimeType(fullUrl),
        buffer: Buffer.alloc(0),
        size: 0
      });
    }
  });

  // Download all assets
  const downloadedAssets = await Promise.all(
    assets.map(async (asset) => {
      try {
        const downloaded = await downloadAsset(asset.url);
        return {
          ...asset,
          buffer: downloaded.buffer,
          size: downloaded.size
        };
      } catch (error) {
        console.error(`Failed to download ${asset.url}:`, error);
        return null;
      }
    })
  );

  // Filter out failed downloads and duplicates
  const validAssets = downloadedAssets
    .filter((asset): asset is NonNullable<typeof asset> => asset !== null)
    .filter((asset, index, self) => 
      self.findIndex(a => a.url === asset.url) === index
    );

  return validAssets;
}

async function downloadAsset(url: string): Promise<{ buffer: Buffer; size: number }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      buffer,
      size: buffer.length
    };
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    throw error;
  }
}

function getImageMimeType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'webp':
      return 'image/webp';
    case 'ico':
      return 'image/x-icon';
    default:
      return 'image/jpeg';
  }
}

function getFontMimeType(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    default:
      return 'font/woff2';
  }
} 