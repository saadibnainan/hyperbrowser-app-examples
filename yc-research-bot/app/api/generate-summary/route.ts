import { NextRequest, NextResponse } from 'next/server';
import { generateCompanySummary } from '@/lib/openai';
import { scrapeCompanyWebsite } from '@/lib/hyperbrowser';
import { CompanyWithSummary } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const { company }: { company: CompanyWithSummary } = await request.json();
    
    console.log('Generating summary for:', company.name);
    
    // Generate AI summary using only the already scraped data
    // This is much faster and doesn't require additional API calls
    const aiSummary = await generateCompanySummary(company, '');
    
    return NextResponse.json({
      success: true,
      aiSummary,
      message: 'Summary generated from existing company data',
    });
  } catch (error) {
    console.error('Error in generate-summary API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 