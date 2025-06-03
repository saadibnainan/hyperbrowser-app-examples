import { NextRequest, NextResponse } from 'next/server';
import { Hyperbrowser } from '@hyperbrowser/sdk';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    const apiKey = request.headers.get('x-api-key');

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Hyperbrowser API key is required' }, { status: 400 });
    }

    // Initialize Hyperbrowser with the provided API key
    const hb = new Hyperbrowser({
      apiKey: apiKey,
    });

    // Extract content from the URL using the correct API
    const result = await hb.scrape.startAndWait({
      url,
      scrapeOptions: {
        formats: ["markdown", "html"],
        onlyMainContent: true,
        timeout: 15000
      }
    });

    // Extract title and content from the response
    let title = result.data?.metadata?.title || 'Untitled Article';
    let content = result.data?.markdown || result.data?.html || '';
    let metadata = result.data?.metadata || {};

    // If content is too short, try again without onlyMainContent filter
    if (content.length < 200) {
      const fallbackResult = await hb.scrape.startAndWait({
        url,
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: false,
          timeout: 15000
        }
      });
      
      content = fallbackResult.data?.markdown || content;
    }

    // Clean up the content
    content = cleanContent(content);
    
    // Create a structured response
    const structuredContent = {
      title: typeof title === 'string' ? title.trim() : String(title).trim(),
      content: content.trim(),
      summary: metadata.description || '',
      author: metadata.author || '',
      date: metadata.publishedTime || metadata.modifiedTime || '',
      url,
      wordCount: content.split(' ').length,
      extractedAt: new Date().toISOString()
    };

    return NextResponse.json(structuredContent);

  } catch (error) {
    console.error('Error extracting content:', error);
    return NextResponse.json(
      { error: 'Failed to extract content from the URL. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}

function cleanContent(content: string): string {
  // Remove extra whitespace and clean up the content
  return content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
    .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters but keep punctuation
    .trim();
} 