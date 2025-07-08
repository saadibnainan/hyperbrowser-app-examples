import { NextRequest, NextResponse } from 'next/server';
import { kv } from '../../../../lib/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      );
    }

    // Get cached data
    const cachedData = kv.get(slug);
    
    if (!cachedData) {
      return NextResponse.json(
        { 
          error: 'Data not found',
          message: 'This API endpoint may have expired or never existed. Generate a new API at the main page.'
        },
        { status: 404 }
      );
    }

    // Return data with metadata
    const response = {
      data: cachedData.json,
      meta: {
        url: cachedData.url,
        lastUpdated: new Date(cachedData.lastUpdated).toISOString(),
        slug: cachedData.slug,
        cacheAge: Date.now() - cachedData.lastUpdated,
        generatedAt: new Date().toISOString()
      }
    };

    // Add CORS headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    });

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error serving data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve data'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 