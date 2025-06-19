import { NextRequest, NextResponse } from 'next/server';
import { sendToSlack } from '@/lib/slack';
import { CompanyWithSummary } from '@/types/company';

export async function POST(request: NextRequest) {
  try {
    const company: CompanyWithSummary = await request.json();
    
    console.log('Sending to Slack:', company.name);
    
    const success = await sendToSlack(company);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Company sent to Slack successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send to Slack',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-to-slack API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send to Slack',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 