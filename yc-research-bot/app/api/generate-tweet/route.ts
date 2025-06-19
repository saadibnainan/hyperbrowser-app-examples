import { NextRequest, NextResponse } from 'next/server';
import { generateTweet } from '@/lib/openai';
import { CompanyWithSummary } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const company: CompanyWithSummary = await request.json();
    
    console.log('Generating tweet for:', company.name);
    
    const tweetText = await generateTweet(company);
    
    return NextResponse.json({
      success: true,
      tweet: tweetText,
    });
  } catch (error) {
    console.error('Error in generate-tweet API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate tweet',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 