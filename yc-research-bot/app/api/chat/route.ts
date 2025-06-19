import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/openai';

// In-memory storage for demo (in production, use a proper database)
let storedCompanies: any[] = [];
let lastDataUpdate = '';
let chatHistory: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { message, companies } = await request.json();
    
    // Update stored companies if provided
    if (companies && companies.length > 0) {
      storedCompanies = companies;
      lastDataUpdate = new Date().toISOString();
    }
    
    console.log('Chat query:', message);
    console.log('Available companies:', storedCompanies.length);
    
    if (storedCompanies.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No company data available. Please scrape some companies first.',
      });
    }
    
    const response = await generateChatResponse(message, storedCompanies);
    
    // Store chat interaction for analytics
    const chatEntry = {
      id: Date.now().toString(),
      query: message,
      response: response.answer,
      context: response.context,
      timestamp: new Date().toISOString(),
    };
    
    chatHistory.push(chatEntry);
    
    // Keep only last 50 chat entries to prevent memory issues
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(-50);
    }
    
    return NextResponse.json({
      success: true,
      response: response.answer,
      context: response.context,
      dataLastUpdated: lastDataUpdate,
      analytics: {
        totalQueries: chatHistory.length,
        queryType: response.context.queryType,
        companiesAnalyzed: response.context.totalCompanies,
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process chat query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Get analytics about chat usage and company data
  const queryTypes = chatHistory.reduce((acc, entry) => {
    const type = entry.context?.queryType || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const industries = storedCompanies.reduce((acc, company) => {
    const description = company.description?.toLowerCase() || '';
    
    if (description.includes('ai') || description.includes('artificial intelligence')) {
      acc['AI/ML'] = (acc['AI/ML'] || 0) + 1;
    }
    if (description.includes('fintech') || description.includes('finance')) {
      acc['Fintech'] = (acc['Fintech'] || 0) + 1;
    }
    if (description.includes('health') || description.includes('medical')) {
      acc['Healthcare'] = (acc['Healthcare'] || 0) + 1;
    }
    if (description.includes('developer') || description.includes('api')) {
      acc['Dev Tools'] = (acc['Dev Tools'] || 0) + 1;
    }
    if (description.includes('b2b') || description.includes('enterprise')) {
      acc['Enterprise'] = (acc['Enterprise'] || 0) + 1;
    }
    
    return acc;
  }, {});
  
  const batches = [...new Set(storedCompanies.map(c => c.batch))];
  
  return NextResponse.json({
    success: true,
    analytics: {
      companiesCount: storedCompanies.length,
      lastDataUpdate,
      totalQueries: chatHistory.length,
      queryTypes,
      industries,
      batches,
      recentQueries: chatHistory.slice(-5).map(entry => ({
        query: entry.query,
        queryType: entry.context?.queryType,
        timestamp: entry.timestamp,
      })),
    },
  });
} 