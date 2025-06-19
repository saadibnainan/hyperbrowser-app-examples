import { NextRequest, NextResponse } from 'next/server';
import { generateFounderEmail } from '@/lib/openai';
import { guessFounderEmail } from '@/lib/email';
import { CompanyWithSummary } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const { company, context }: { company: CompanyWithSummary; context?: string } = await request.json();
    
    console.log('Generating email for:', company.name);
    
    // Generate email template
    const emailTemplate = await generateFounderEmail(company, context);
    
    // Guess possible founder emails
    const possibleEmails = guessFounderEmail(company.name, company.website);
    
    return NextResponse.json({
      success: true,
      email: emailTemplate,
      possibleEmails,
    });
  } catch (error) {
    console.error('Error in generate-email API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 