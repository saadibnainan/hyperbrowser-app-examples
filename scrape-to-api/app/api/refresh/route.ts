import { NextRequest, NextResponse } from 'next/server';
import { kv } from '../../../lib/kv';
import { crawlPage } from '../../../lib/crawl';
import { extractDataFromHtml, SelectorConfig } from '../../../lib/selectors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const token = searchParams.get('token');
    
    if (!slug || !token) {
      return NextResponse.json(
        { error: 'Missing required parameters: slug, token' },
        { status: 400 }
      );
    }

    // Validate token (simple validation)
    const expectedToken = generateRefreshToken(slug);
    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Get existing cached data
    const cachedData = kv.get(slug);
    if (!cachedData) {
      return NextResponse.json(
        { error: 'Data not found for slug' },
        { status: 404 }
      );
    }

    // Check if refresh is needed (minimum 1 hour between refreshes)
    const hoursSinceUpdate = (Date.now() - cachedData.lastUpdated) / (1000 * 60 * 60);
    if (hoursSinceUpdate < 1) {
      return NextResponse.json({
        message: 'Data is still fresh, no refresh needed',
        data: cachedData.json,
        lastUpdated: new Date(cachedData.lastUpdated).toISOString(),
        nextRefreshAvailable: new Date(cachedData.lastUpdated + 60 * 60 * 1000).toISOString()
      });
    }

    // Since we don't store the original selectors and API key in cache,
    // we'll need to return instructions for manual refresh
    return NextResponse.json({
      error: 'Automatic refresh not available',
      message: 'Please regenerate the API from the main page to get fresh data',
      currentData: cachedData.json,
      lastUpdated: new Date(cachedData.lastUpdated).toISOString()
    }, { status: 501 });

  } catch (error) {
    console.error('Error in refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate refresh token (same as in generate route)
function generateRefreshToken(slug: string): string {
  const secret = process.env.REFRESH_SECRET || 'default-secret';
  const data = `${slug}:${secret}`;
  return Buffer.from(data).toString('base64');
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET method for refresh endpoint'
  }, { status: 405 });
} 