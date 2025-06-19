import OpenAI from 'openai';
import { CompanyWithSummary, EmailTemplate, CompanyActivity, WeeklyDigest } from '@/types/company';

// Only instantiate OpenAI client on server-side
function getOpenAIClient() {
  if (typeof window !== 'undefined') {
    throw new Error('OpenAI client should only be used on server-side');
  }
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function generateCompanySummary(
  company: CompanyWithSummary,
  websiteContent?: string
): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `
Analyze this YC company and provide a clear, concise summary of what they do:

Company Name: ${company.name}
YC Description: ${company.description}
Batch: ${company.batch}
Website: ${company.website || 'Not provided'}
${websiteContent ? `Website Content: ${websiteContent.slice(0, 1500)}...` : ''}

Please provide a 2-3 sentence summary that explains:
1. What problem they solve
2. How their solution works
3. Their target market or business model

Keep it professional, clear, and under 150 words.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || 'Summary generation failed.';
  } catch (error) {
    console.error('Error generating summary:', error);
    return `${company.name} is a ${company.batch} YC company. ${company.description}`;
  }
}

export async function generateFounderEmail(
  company: CompanyWithSummary,
  context?: string
): Promise<EmailTemplate> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `
Generate a professional, personalized cold email to the founder of this YC company:

Company: ${company.name}
Description: ${company.description}
Website: ${company.website || 'Not provided'}
${company.aiSummary ? `AI Summary: ${company.aiSummary}` : ''}
${context ? `Additional Context: ${context}` : ''}

Create a cold outreach email that:
1. Is concise (under 100 words)
2. Shows genuine interest in their work
3. Offers value (not just asking for something)
4. Has a clear, low-pressure call to action
5. Sounds natural and human

Return both subject line and email body.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse subject and body
    const lines = content.split('\n').filter(line => line.trim());
    const subjectLine = lines.find(line => 
      line.toLowerCase().includes('subject:') || 
      line.toLowerCase().includes('subject line:')
    )?.replace(/subject:?\s*/i, '') || `Interested in ${company.name}`;
    
    const bodyStartIndex = lines.findIndex(line => 
      line.toLowerCase().includes('body:') || 
      line.toLowerCase().includes('email:') ||
      line.toLowerCase().includes('message:')
    );
    
    const body = bodyStartIndex >= 0 
      ? lines.slice(bodyStartIndex + 1).join('\n').trim()
      : content.replace(/subject:.*$/im, '').trim();

    return {
      subject: subjectLine,
      body: body || `Hi there,\n\nI came across ${company.name} and was impressed by your work in ${company.description.split('.')[0]}.\n\nWould love to learn more about your journey and see if there are ways we could collaborate.\n\nBest regards`,
      founderName: 'Founder',
    };
  } catch (error) {
    console.error('Error generating email:', error);
    return {
      subject: `Interested in ${company.name}`,
      body: `Hi there,\n\nI came across ${company.name} and was impressed by your work.\n\nWould love to learn more about your journey.\n\nBest regards`,
      founderName: 'Founder',
    };
  }
}

export async function generateTweet(company: CompanyWithSummary): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `
Create an engaging Twitter thread about this YC company:

Company: ${company.name}
Description: ${company.description}
Batch: ${company.batch}
Website: ${company.website || ''}

Create a tweet that:
1. Is under 280 characters
2. Highlights what makes them interesting
3. Uses relevant hashtags
4. Sounds natural and engaging
5. Includes their website if available

Make it informative but not promotional.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content?.trim() || 
      `Interesting YC company: ${company.name} - ${company.description.slice(0, 100)}... ${company.website || ''} #YCombinator #Startups`;
  } catch (error) {
    console.error('Error generating tweet:', error);
    return `Check out ${company.name} from ${company.batch}: ${company.description.slice(0, 100)}... ${company.website || ''} #YCombinator`;
  }
}

export async function generateChatResponse(
  query: string,
  companies: CompanyWithSummary[]
): Promise<{ answer: string; context: any }> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `
You are a YC startup research assistant and competitive intelligence expert. Answer the user's question about YC companies based on the provided data.

User Question: ${query}

Available Company Data:
${companies.slice(0, 50).map(company => `
- ${company.name} (${company.batch}): ${company.description}
  Website: ${company.website || 'N/A'}
  Location: ${company.location || 'N/A'}
  Team Size: ${company.teamSize || 'N/A'}
  ${company.aiSummary ? `Summary: ${company.aiSummary}` : ''}
`).join('\n')}

${companies.length > 50 ? `... and ${companies.length - 50} more companies` : ''}

Instructions for YC Founder Intelligence:
1. Answer based ONLY on the provided company data
2. Focus on competitive intelligence and actionable insights
3. When discussing competitors, mention specific company names and details
4. For market analysis questions, provide concrete numbers and comparisons
5. For networking questions, suggest specific companies and reasons why
6. Include batch information when relevant for timing and context
7. Highlight opportunities for partnerships, learning, or differentiation
8. Use markdown formatting for better readability
9. Be specific about team sizes, locations, and business models when available
10. If asking about fundraising, hiring, or growth - acknowledge data limitations but provide what insights you can

Common founder query patterns to optimize for:
- Competitive analysis: "Who are my competitors in [industry]?"
- Market research: "What's the average team size for [type] companies?"
- Networking: "Which companies should I partner with?"
- Benchmarking: "How does my company compare to others?"
- Opportunity identification: "What gaps exist in the market?"

Answer:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const answer = response.choices[0]?.message?.content?.trim() || 'Sorry, I couldn\'t process your query.';
    
    // Extract enhanced context for debugging and analytics
    const context = {
      totalCompanies: companies.length,
      queryLength: query.length,
      queryType: detectQueryType(query),
      sampledCompanies: companies.slice(0, 5).map(c => c.name),
      relevantBatches: [...new Set(companies.map(c => c.batch))].slice(0, 5),
      industries: extractIndustries(companies),
    };

    return { answer, context };
  } catch (error) {
    console.error('Error generating chat response:', error);
    return {
      answer: 'Sorry, I encountered an error while processing your query. Please try again.',
      context: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Helper function to detect query type for analytics
function detectQueryType(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('competitor') || lowerQuery.includes('similar') || lowerQuery.includes('compete')) {
    return 'competitive_analysis';
  }
  if (lowerQuery.includes('partner') || lowerQuery.includes('collaborate') || lowerQuery.includes('work with')) {
    return 'partnership';
  }
  if (lowerQuery.includes('team size') || lowerQuery.includes('employee') || lowerQuery.includes('hiring')) {
    return 'team_analysis';
  }
  if (lowerQuery.includes('funding') || lowerQuery.includes('raised') || lowerQuery.includes('investment')) {
    return 'funding_analysis';
  }
  if (lowerQuery.includes('average') || lowerQuery.includes('compare') || lowerQuery.includes('benchmark')) {
    return 'benchmarking';
  }
  if (lowerQuery.includes('location') || lowerQuery.includes('city') || lowerQuery.includes('remote')) {
    return 'location_analysis';
  }
  
  return 'general_inquiry';
}

// Helper function to extract industry insights
function extractIndustries(companies: CompanyWithSummary[]): Record<string, number> {
  const industries: Record<string, number> = {};
  
  companies.forEach(company => {
    const description = company.description.toLowerCase();
    
    // Simple industry detection based on keywords
    if (description.includes('ai') || description.includes('artificial intelligence') || description.includes('machine learning')) {
      industries['AI/ML'] = (industries['AI/ML'] || 0) + 1;
    }
    if (description.includes('fintech') || description.includes('finance') || description.includes('payment')) {
      industries['Fintech'] = (industries['Fintech'] || 0) + 1;
    }
    if (description.includes('health') || description.includes('medical') || description.includes('healthcare')) {
      industries['Healthcare'] = (industries['Healthcare'] || 0) + 1;
    }
    if (description.includes('developer') || description.includes('api') || description.includes('infrastructure')) {
      industries['Dev Tools'] = (industries['Dev Tools'] || 0) + 1;
    }
    if (description.includes('ecommerce') || description.includes('marketplace') || description.includes('retail')) {
      industries['E-commerce'] = (industries['E-commerce'] || 0) + 1;
    }
    if (description.includes('education') || description.includes('learning') || description.includes('edtech')) {
      industries['Education'] = (industries['Education'] || 0) + 1;
    }
    if (description.includes('enterprise') || description.includes('b2b') || description.includes('business')) {
      industries['Enterprise'] = (industries['Enterprise'] || 0) + 1;
    }
    if (description.includes('consumer') || description.includes('social') || description.includes('mobile app')) {
      industries['Consumer'] = (industries['Consumer'] || 0) + 1;
    }
  });
  
  return industries;
}

// Founder-specific query templates
export const FOUNDER_QUERY_TEMPLATES = {
  competitive: [
    "Who are my main competitors in the AI space?",
    "Show me companies with similar business models to mine",
    "Which companies in fintech are from recent batches?",
    "Find B2B SaaS companies with small team sizes",
    "What companies are solving similar problems?"
  ],
  market: [
    "What's the average team size for healthcare startups?",
    "How many AI companies are in Winter 2024?",
    "Show me the geographic distribution of companies",
    "Which industries have the most YC companies?",
    "What's the typical company description length?"
  ],
  networking: [
    "Which companies should I partner with for my API business?",
    "Find companies that might be potential customers",
    "Show me companies in San Francisco I should meet",
    "Which founders work on complementary products?",
    "Find companies that could integrate with my platform"
  ],
  benchmarking: [
    "How does my team size compare to similar companies?",
    "What batch has the most successful companies?",
    "Compare Winter 2024 vs Summer 2024 companies",
    "Show me companies that raised funding recently",
    "Which companies have the strongest online presence?"
  ],
  opportunity: [
    "What market gaps exist in the current YC portfolio?",
    "Which industries are underrepresented?",
    "Find potential acquisition targets",
    "Show me companies that might be struggling",
    "What trends do you see across batches?"
  ]
};

export async function generateWeeklyDigest(activities: CompanyActivity[]): Promise<WeeklyDigest> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `
Generate a weekly digest based on these startup activities:

${activities.slice(0, 20).map(activity => `
- ${activity.companyName}: ${activity.title}
  Type: ${activity.type}
  Summary: ${activity.summary}
  Source: ${activity.source}
`).join('\n')}

Create a professional weekly digest that:
1. Summarizes the week's key developments
2. Highlights trending companies and activities
3. Identifies patterns and insights
4. Keeps it concise but informative
5. Uses a professional tone suitable for founders

Format as a structured summary with key highlights.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
    });

    const summary = response.choices[0]?.message?.content?.trim() || 'Weekly digest generation failed.';
    
    // Get top companies by activity count
    const companyActivityCount = activities.reduce((acc, activity) => {
      acc[activity.companyName] = (acc[activity.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCompanies = Object.entries(companyActivityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company]) => company);

    return {
      id: `digest-${Date.now()}`,
      weekOf: new Date().toISOString().split('T')[0],
      totalActivities: activities.length,
      topCompanies,
      summary,
      highlights: activities.slice(0, 10),
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    
    // Fallback digest
    const companyActivityCount = activities.reduce((acc, activity) => {
      acc[activity.companyName] = (acc[activity.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCompanies = Object.entries(companyActivityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company]) => company);

    return {
      id: `digest-${Date.now()}`,
      weekOf: new Date().toISOString().split('T')[0],
      totalActivities: activities.length,
      topCompanies,
      summary: `This week we tracked ${activities.length} activities across ${topCompanies.length} companies. Key highlights include activity from ${topCompanies.slice(0, 3).join(', ')}.`,
      highlights: activities.slice(0, 10),
      createdAt: new Date().toISOString(),
    };
  }
} 