import { NextRequest, NextResponse } from 'next/server';
import { CompanyWithSummary, CompanyDeepResearch } from '@/types/company';
import { Hyperbrowser } from '@hyperbrowser/sdk';

function getClient(apiKey?: string) {
  const key = apiKey || process.env.HYPERBROWSER_API_KEY;
  if (!key) {
    throw new Error('Hyperbrowser API key not provided');
  }
  return new Hyperbrowser({ apiKey: key });
}

export async function POST(request: NextRequest) {
  try {
    const { company } = await request.json();
    const apiKey = request.headers.get('X-API-Key');
    
    if (!company || !company.website) {
      return NextResponse.json({
        success: false,
        error: 'Company and website URL are required for deep research analysis',
      }, { status: 400 });
    }
    
    console.log(`Starting deep research analysis for ${company.name}...`);
    
    const client = getClient(apiKey || undefined);
    
    // Run analyses in parallel with individual error handling
    const [websiteAnalysis, socialPresence, competitiveIntel, founderIntel] = await Promise.allSettled([
      analyzeWebsite(company, client),
      analyzeSocialPresence(company, client),
      analyzeCompetitivePosition(company, client),
      analyzeFounders(company, client),
    ]);
    
    const deepResearchData: CompanyDeepResearch = {
      ...company,
      deepAnalysis: {
        websiteAnalysis: websiteAnalysis.status === 'fulfilled' ? websiteAnalysis.value : {},
        socialPresence: socialPresence.status === 'fulfilled' ? socialPresence.value : {},
        competitiveIntel: competitiveIntel.status === 'fulfilled' ? competitiveIntel.value : {},
        founderIntel: founderIntel.status === 'fulfilled' ? founderIntel.value : {},
      }
    };
    
    return NextResponse.json({
      success: true,
      company: deepResearchData,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Error in deep research analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform deep research analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function analyzeWebsite(company: CompanyWithSummary, client: Hyperbrowser) {
  try {
    console.log(`Analyzing website: ${company.website}`);
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Website analysis timeout')), 30000)
    );
    
    const extractPromise = client.extract.startAndWait({
      urls: [company.website!],
      prompt: `Analyze this company website and extract detailed information about ${company.name}. Focus on:
        
        1. TECHNOLOGY STACK: What technologies, frameworks, or tools do they use or mention?
        2. PRODUCT FEATURES: What are their main features, capabilities, or services?
        3. PRICING: Extract pricing plans, costs, or pricing models if available
        4. TEAM INFORMATION: Any team member names, roles, or backgrounds mentioned
        5. JOB OPENINGS: Current job postings or hiring information
        6. BLOG/NEWS: Recent blog posts, news, or updates
        7. CUSTOMER TESTIMONIALS: Any customer quotes, reviews, or case studies
        8. LAST UPDATED: When was the site last updated or when was recent content published?
        
        Be specific and extract actual data, not generic descriptions.`,
      schema: {
        type: 'object',
        properties: {
          techStack: {
            type: 'array',
            items: { type: 'string' },
            description: 'Technologies, frameworks, or tools mentioned'
          },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Main product features or capabilities'
          },
          pricing: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                plan: { type: 'string' },
                price: { type: 'string' },
                features: { type: 'array', items: { type: 'string' } },
                target: { type: 'string' }
              }
            }
          },
          teamMembers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                background: { type: 'string' }
              }
            }
          },
          jobOpenings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                department: { type: 'string' },
                location: { type: 'string' },
                requirements: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          blogPosts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                publishedDate: { type: 'string' },
                summary: { type: 'string' }
              }
            }
          },
          customerTestimonials: {
            type: 'array',
            items: { type: 'string' }
          },
          lastUpdated: { type: 'string' }
        }
      },
      waitFor: 5000,
      maxLinks: 3,
    });
    
    const extractResult = await Promise.race([extractPromise, timeoutPromise]) as any;
    return extractResult.data || {};
  } catch (error) {
    console.error(`Website analysis failed for ${company.name}:`, error);
    return {};
  }
}

async function analyzeSocialPresence(company: CompanyWithSummary, client: Hyperbrowser) {
  try {
    console.log(`Analyzing social presence for ${company.name}`);
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Social analysis timeout')), 20000)
    );
    
    const socialPromise = client.extract.startAndWait({
      urls: [company.website!],
      prompt: `Find social media links and handles for ${company.name}. Look for:
        - Twitter/X profile URL and handle
        - LinkedIn company page URL
        - GitHub organization URL
        - Any other social media presence
        - Recent social media activity or engagement metrics if visible`,
      schema: {
        type: 'object',
        properties: {
          twitterHandle: { type: 'string' },
          twitterFollowers: { type: 'number' },
          linkedinUrl: { type: 'string' },
          githubUrl: { type: 'string' },
          lastSocialActivity: { type: 'string' },
          socialEngagement: { type: 'number' }
        }
      },
      waitFor: 3000,
      maxLinks: 1,
    });
    
    const socialSearchResult = await Promise.race([socialPromise, timeoutPromise]) as any;
    return socialSearchResult.data || {};
  } catch (error) {
    console.error(`Social analysis failed for ${company.name}:`, error);
    return {};
  }
}

async function analyzeCompetitivePosition(company: CompanyWithSummary, client: Hyperbrowser) {
  try {
    console.log(`Analyzing competitive position for ${company.name}`);
    
    const competitorSearchUrl = `https://www.google.com/search?q="${company.name}"+competitors+alternative+vs`;
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Competitive analysis timeout')), 25000)
    );
    
    const competitivePromise = client.extract.startAndWait({
      urls: [competitorSearchUrl],
      prompt: `Research the competitive landscape for ${company.name}. Extract:
        - Direct competitors mentioned in search results
        - Market position or category they compete in
        - Unique advantages or differentiators mentioned
        - Potential weaknesses or challenges
        - Funding stage or investment information if available
        - Estimated revenue or business model insights`,
      schema: {
        type: 'object',
        properties: {
          directCompetitors: {
            type: 'array',
            items: { type: 'string' }
          },
          marketPosition: { type: 'string' },
          uniqueAdvantages: {
            type: 'array',
            items: { type: 'string' }
          },
          potentialWeaknesses: {
            type: 'array',
            items: { type: 'string' }
          },
          fundingStage: { type: 'string' },
          estimatedRevenue: { type: 'string' }
        }
      },
      waitFor: 4000,
      maxLinks: 2,
    });
    
    const competitiveResult = await Promise.race([competitivePromise, timeoutPromise]) as any;
    return competitiveResult.data || {};
  } catch (error) {
    console.error(`Competitive analysis failed for ${company.name}:`, error);
    return {};
  }
}

async function analyzeFounders(company: CompanyWithSummary, client: Hyperbrowser) {
  try {
    console.log(`Analyzing founders for ${company.name}`);
    
    const founderSearchUrl = `https://www.google.com/search?q="${company.name}"+founder+CEO+team+LinkedIn`;
    
    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Founder analysis timeout')), 25000)
    );
    
    const founderPromise = client.extract.startAndWait({
      urls: [founderSearchUrl],
      prompt: `Research the founders and key team members of ${company.name}. Extract:
        - Founder names and roles
        - LinkedIn profiles if available
        - Twitter handles if available
        - Previous companies or experience
        - Educational background
        - Areas of expertise or specialization`,
      schema: {
        type: 'object',
        properties: {
          founders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                linkedin: { type: 'string' },
                twitter: { type: 'string' },
                previousCompanies: { type: 'array', items: { type: 'string' } },
                education: { type: 'string' },
                expertise: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          previousExperience: {
            type: 'array',
            items: { type: 'string' }
          },
          education: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      waitFor: 4000,
      maxLinks: 2,
    });
    
    const founderResult = await Promise.race([founderPromise, timeoutPromise]) as any;
    return founderResult.data || {};
  } catch (error) {
    console.error(`Founder analysis failed for ${company.name}:`, error);
    return {};
  }
} 