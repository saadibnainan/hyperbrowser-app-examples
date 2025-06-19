import { NextRequest, NextResponse } from 'next/server';
import { scrapeYCCompanies } from '@/lib/hyperbrowser';
import { SearchFilters } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json();
    const apiKey = request.headers.get('X-API-Key');
    
    console.log('Scraping YC companies with filters:', filters);
    
    const companies = await scrapeYCCompanies(filters, apiKey || undefined);
    
    return NextResponse.json({
      success: true,
      companies,
      count: companies.length,
    });
  } catch (error) {
    console.error('Error in scrape-companies API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scrape companies',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 