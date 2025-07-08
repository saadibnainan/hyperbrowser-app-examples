import { NextRequest, NextResponse } from 'next/server';
import { crawlPage } from '../../../lib/crawl';
import { extractDataFromHtml, SelectorConfig } from '../../../lib/selectors';
import { generateCodeFiles } from '../../../lib/codegen';
import { createZipBuffer } from '../../../lib/zip';
import { kv, generateSlug } from '../../../lib/kv';

// Helper function to chunk HTML content
function chunkHtml(html: string, chunkSize: number = 50000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < html.length; i += chunkSize) {
    chunks.push(html.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, selectors, refreshRate, mode } = body;
    const apiKey = process.env.HYPERBROWSER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'HYPERBROWSER_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Get base URL for API generation
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Create response stream for progress updates
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (message: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message })}\n\n`));
        };

        try {
          // Step 1: Crawl the page
          sendProgress('🚀 Starting page crawl...');
          
          const crawlResult = await crawlPage({
            url,
            apiKey,
            onProgress: sendProgress
          });

          if (!crawlResult.success) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: crawlResult.error 
            })}\n\n`));
            controller.close();
            return;
          }

          // If this is just a preview request, return the HTML in chunks
          if (mode === 'preview') {
            sendProgress('✅ Page loaded successfully!');
            
            // Split HTML into manageable chunks
            const chunks = chunkHtml(crawlResult.html);
            const totalChunks = chunks.length;
            
            // Send chunk count first
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'html_start', 
              totalChunks 
            })}\n\n`));
            
            // Send each chunk
            for (let i = 0; i < chunks.length; i++) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                type: 'html_chunk', 
                chunk: chunks[i],
                chunkIndex: i 
              })}\n\n`));
            }
            
            // Send completion message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'html_end',
              title: crawlResult.title 
            })}\n\n`));
            
            controller.close();
            return;
          }

          // Full API generation mode
          if (!selectors || !Array.isArray(selectors)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Missing selectors for API generation' 
            })}\n\n`));
            controller.close();
            return;
          }

          // Generate unique slug
          const slug = generateSlug(url);

          // Step 2: Extract data using selectors
          sendProgress('📊 Extracting data from page...');
          
          const selectorConfigs: SelectorConfig[] = selectors.map((s: any) => ({
            id: s.id,
            selector: s.selector,
            name: s.name,
            attribute: s.attribute || 'text',
            multiple: s.multiple || false
          }));

          const extractedData = extractDataFromHtml(crawlResult.html, selectorConfigs);
          
          if (Object.keys(extractedData).length === 0) {
            sendProgress('⚠️ No data extracted - check your selectors');
          } else {
            sendProgress(`✅ Extracted ${Object.keys(extractedData).length} data fields`);
          }

          // Step 3: Store data in KV
          sendProgress('💾 Caching data...');
          kv.set(slug, extractedData, url);

          // Step 4: Generate API files
          sendProgress('🔧 Generating API files...');
          
          const codegenResult = generateCodeFiles({
            slug,
            url,
            title: crawlResult.title || 'Scraped Data',
            selectors: selectorConfigs,
            baseUrl,
            sampleData: extractedData
          });

          // Step 5: Create ZIP bundle
          sendProgress('📦 Creating download bundle...');
          
          const zipBuffer = await createZipBuffer({
            slug,
            title: crawlResult.title || 'Scraped Data',
            codegenResult,
            sampleData: extractedData
          });

          // Step 6: Send final result
          sendProgress('🎉 API generation complete!');
          
          const result = {
            type: 'success',
            data: {
              slug,
              endpointUrl: `${baseUrl}/api/data/${slug}`,
              sampleData: extractedData,
              downloadUrl: `data:application/zip;base64,${zipBuffer.toString('base64')}`,
              refreshUrl: refreshRate ? `${baseUrl}/api/refresh?slug=${slug}&token=${generateRefreshToken(slug)}` : null,
              files: {
                openapi: codegenResult.openapi,
                sdk: codegenResult.sdk,
                postman: codegenResult.postman
              }
            }
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
          controller.close();

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            type: 'error', 
            error: errorMessage 
          })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple token generation for refresh URLs
function generateRefreshToken(slug: string): string {
  const secret = process.env.REFRESH_SECRET || 'default-secret';
  const data = `${slug}:${secret}`;
  return Buffer.from(data).toString('base64');
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Scrape2API Generate Endpoint',
    method: 'POST',
    usage: 'Send POST request with apiKey, url, and selectors'
  });
} 