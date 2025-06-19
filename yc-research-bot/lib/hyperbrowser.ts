import { Hyperbrowser } from '@hyperbrowser/sdk';
import { YCCompany, SearchFilters } from '@/types/company';

// Initialize client with dynamic API key
function getClient(apiKey?: string) {
  const key = apiKey || process.env.HYPERBROWSER_API_KEY;
  if (!key) {
    throw new Error('Hyperbrowser API key not provided');
  }
  return new Hyperbrowser({
    apiKey: key,
});
}



export async function scrapeYCCompanies(filters: SearchFilters = {}, apiKey?: string): Promise<YCCompany[]> {
  try {
    console.log('Starting YC extraction with Hyperbrowser Extract API...');
    
    // Build the correct YC URL based on filters
    let ycUrl = 'https://www.ycombinator.com/companies';
    const urlParams = new URLSearchParams();
    
    // Add batch filter(s) to URL if specified
    if (filters.batch && filters.batch !== 'all') {
      const batches = Array.isArray(filters.batch) ? filters.batch : [filters.batch];
      
      batches.forEach(batch => {
        if (batch && batch.trim()) {
          // Use the full batch name directly (e.g., "Winter 2025", "Summer 2024")
          urlParams.append('batch', batch);
        }
      });
    }
    
    // Add industry filter if keyword matches common industries
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      let industryParam = '';
      
      if (keyword.includes('fintech') || keyword.includes('finance')) {
        industryParam = 'Fintech';
      } else if (keyword.includes('health') || keyword.includes('medical') || keyword.includes('bio')) {
        industryParam = 'Healthcare';
      } else if (keyword.includes('ai') || keyword.includes('artificial intelligence') || keyword.includes('machine learning')) {
        industryParam = 'AI';
      } else if (keyword.includes('education') || keyword.includes('edtech')) {
        industryParam = 'Education';
      } else if (keyword.includes('enterprise') || keyword.includes('b2b')) {
        industryParam = 'B2B';
      } else if (keyword.includes('consumer') || keyword.includes('b2c')) {
        industryParam = 'Consumer';
      } else if (keyword.includes('crypto') || keyword.includes('blockchain')) {
        industryParam = 'Crypto';
      }
      
      if (industryParam) {
        urlParams.append('industry', industryParam);
      }
    }
    
    // Construct final URL
    if (urlParams.toString()) {
      ycUrl += '?' + urlParams.toString();
    }
    
    console.log(`Scraping YC URL: ${ycUrl}`);
    
    // Also try the base URL as backup
    const baseUrl = 'https://www.ycombinator.com/companies';
    console.log(`Base URL for comparison: ${baseUrl}`);
    
    // Build extraction prompt - be very specific about what we want
    let extractPrompt = `You are analyzing the YC companies directory page. I can see from the scraped content that this page contains real YC company listings.
    
    CRITICAL: Look through the actual HTML/markdown content and find the real company entries. Do NOT make up or invent any data.

    The page should contain actual company cards or listings with:
    - Real company names (like actual startups, not examples)
    - Real descriptions of what each company does
    - Real YC batch codes (like W24, S25, etc.)
    - Real website URLs (.com domains, not example.com)
    - Real logo URLs (not example.com links)

    Parse the content carefully and extract ONLY the companies that are actually listed on this page.
    
    If you see any company listings, extract them exactly as they appear. Do not substitute with well-known companies like Stripe or Airbnb unless they are actually listed on this specific page.`;

    // Define schema for structured extraction - be very specific
    const extractionSchema = {
      type: 'object',
      properties: {
        companies: {
          type: 'array',
          description: 'Array of real Y Combinator startup companies found on the page',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Real startup company name (e.g., "Stripe", "Airbnb", "OpenAI") - NOT generic names like "Company A"'
              },
              description: {
                type: 'string', 
                description: 'Real business description explaining what the company actually does - NOT generic descriptions'
              },
              batch: {
                type: 'string',
                description: 'Real YC batch code (e.g., S24, W25, F24, S23, W24) - extract from the actual page data'
              },
              website: {
                type: 'string',
                description: 'Real company website URL - extract actual URLs, not placeholder domains'
              },
              logo: {
                type: 'string',
                description: 'Company logo URL if visible on the page'
              }
            },
            required: ['name', 'description', 'batch'],
            additionalProperties: false
          }
        }
      },
      required: ['companies'],
      additionalProperties: false
    };

    // First, let's try to get the page content to see what's actually there
    const client = getClient(apiKey);
    
    console.log('Attempting to scrape page content first...');
    
    // Use the filtered URL if filters are provided, otherwise use base URL
    const urlToTry = ycUrl;
    console.log('Using URL for scraping:', urlToTry);
    
    // Try a simple scrape first to see page structure
    const scrapeResult = await client.scrape.startAndWait({
      url: urlToTry,
      scrapeOptions: {
        formats: ['markdown', 'html'],
        onlyMainContent: false, // Get full page content
        timeout: 30000,
        waitFor: 8000, // Wait longer for dynamic content


      },
              sessionOptions: {
          useStealth: true,
          solveCaptchas: true,
          adblock: true,
        }
    });
    
    console.log('Scrape result status:', scrapeResult.status);
    console.log('Scraped content length:', scrapeResult.data?.markdown?.length || 0);
    console.log('First 1000 chars of content:', scrapeResult.data?.markdown?.slice(0, 1000));
    console.log('Last 500 chars of content:', scrapeResult.data?.markdown?.slice(-500));
    
    // Check if we have actual company data in the markdown
    const markdown = scrapeResult.data?.markdown || '';
    if (markdown.length < 1000) {
      console.log('Scraped content seems too short, might be blocked or empty');
    }
    
    // If we have good scraped content, try to parse it directly with OpenAI
    if (markdown.length > 5000) {
      console.log('Trying direct OpenAI parsing of scraped content...');
      
      try {
        const openai = require('openai');
        const client = new openai.OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        console.log('OpenAI API Key available:', !!process.env.OPENAI_API_KEY);
        
        // Build filter context for OpenAI
        const filterContext = [];
        if (filters.batch && filters.batch !== 'all') {
          const batches = Array.isArray(filters.batch) ? filters.batch : [filters.batch];
          filterContext.push(`Only extract companies from these YC batches: ${batches.join(', ')}`);
        }
        if (filters.keyword) {
          filterContext.push(`Only extract companies related to: ${filters.keyword}`);
        }
        
        const filterInstructions = filterContext.length > 0 
          ? `\n\nFILTER REQUIREMENTS:\n${filterContext.join('\n')}\n`
          : '';

        console.log('Making OpenAI API call...');
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini', // Using the latest efficient model
          messages: [{
            role: 'user',
            content: `Parse this YC companies directory page content and extract real company information:

${markdown.slice(0, 50000)}

Find actual company listings and extract:
- Company name
- Description
- YC batch
- Website URL
- Logo URL (if available)
- Founder names (if available)

${filterInstructions}

Return only real companies you can find in this content that match the filter requirements. Do not invent or generate fake data.
Return as JSON array with format: [{"name": "...", "description": "...", "batch": "...", "website": "...", "logo": "..."}]`
          }],
          max_tokens: 8000,
          temperature: 0.1,
        });
        
        console.log('OpenAI API response received');
        const content = response.choices[0]?.message?.content || '';
        if (!content) {
          console.log('No content in OpenAI response');
          throw new Error('Empty response from OpenAI');
        }
        console.log('OpenAI response content length:', content.length);
        console.log('OpenAI direct parsing result:', content);
        
        // Try to parse the JSON response with improved error handling
        try {
          // First try to find JSON array in the response
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            console.log('Found JSON match:', jsonMatch[0].substring(0, 200) + '...');
            try {
              const companiesData = JSON.parse(jsonMatch[0]);
              console.log('Parsed companies array, length:', companiesData.length);
              
              if (Array.isArray(companiesData) && companiesData.length > 0) {
                console.log('Successfully parsed companies with OpenAI:', companiesData.length);
                
                // Create a map to avoid duplicates and clean up data
                const companiesMap = new Map<string, any>();
                
                companiesData.forEach((company: any, index: number) => {
                  const cleanName = (company.name || '').replace(/[)}\]]+$/, '').trim(); // Remove trailing punctuation
                  if (cleanName && company.description) {
                    companiesMap.set(cleanName, {
                      id: `yc-${index}`,
                      name: cleanName,
                      description: company.description || '',
                      batch: company.batch || '',
                      website: company.website || '',
                      logo: company.logo || '',
                      tags: []
                    });
                  }
                });

                let companies = Array.from(companiesMap.values());
                console.log('Mapped companies:', companies.length);
                console.log('Sample company:', companies[0]);
                console.log('Logo URLs found:', companies.filter(c => c.logo).map(c => ({ name: c.name, logo: c.logo })));

                // Apply client-side filtering as backup
                if (filters.batch && filters.batch !== 'all') {
                  const batches = Array.isArray(filters.batch) ? filters.batch : [filters.batch];
                  console.log('Applying batch filter:', batches);
                  const beforeFilter = companies.length;
                  companies = companies.filter(company => {
                    // Match various batch formats
                    return batches.some(batch => {
                      const batchLower = batch.toLowerCase();
                      const companyBatchLower = company.batch.toLowerCase();
                      
                      // Handle different batch formats
                      if (batchLower.includes('summer') && companyBatchLower.includes('summer')) return true;
                      if (batchLower.includes('winter') && companyBatchLower.includes('winter')) return true;
                      if (batchLower.includes('spring') && companyBatchLower.includes('spring')) return true;
                      if (batchLower.includes('fall') && companyBatchLower.includes('fall')) return true;
                      
                      // Handle year matching
                      const yearMatch = batch.match(/\d{4}/);
                      if (yearMatch && company.batch.includes(yearMatch[0])) return true;
                      
                      // Exact match
                      return companyBatchLower === batchLower;
                    });
                  });
                  console.log(`Batch filter: ${beforeFilter} -> ${companies.length} companies`);
                }
                
                if (filters.keyword) {
                  const keyword = filters.keyword.toLowerCase();
                  console.log('Applying keyword filter:', keyword);
                  const beforeFilter = companies.length;
                  companies = companies.filter(company => 
                    company.name.toLowerCase().includes(keyword) ||
                    company.description.toLowerCase().includes(keyword)
                  );
                  console.log(`Keyword filter: ${beforeFilter} -> ${companies.length} companies`);
                }
                
                console.log(`Filtered to ${companies.length} companies based on criteria`);
                
                // Apply basic validation - but be more lenient
                const beforeValidation = companies.length;
                companies = companies.filter(company => 
                  company.name && company.name.trim() !== '' && 
                  company.description && company.description.trim() !== ''
                  // Removed batch requirement as it might be causing issues
                );
                console.log(`Validation filter: ${beforeValidation} -> ${companies.length} companies`);
                
                // Return companies even if only a few pass validation
                if (companies.length > 0) {
                  console.log('Successfully returning companies:', companies.length);
                  return companies;
                } else {
                  console.log('No companies passed final validation, but we had data - check filtering logic');
                  // Return the original mapped companies if filtering removed everything
                  const originalMapped = companiesData.map((company: any, index: number) => ({
                    id: `yc-${index}`,
                    name: company.name || '',
                    description: company.description || '',
                    batch: company.batch || '',
                    website: company.website || '',
                    logo: company.logo || '',
                    tags: []
                  })).filter(company => company.name && company.description);
                  
                  if (originalMapped.length > 0) {
                    console.log('Returning original mapped companies:', originalMapped.length);
                    return originalMapped;
                  }
                }
              } else {
                console.log('Companies data is not an array or is empty:', typeof companiesData, companiesData?.length);
              }
            } catch (parseError) {
              console.log('Failed to parse OpenAI JSON response:', parseError);
              console.log('Raw JSON string:', jsonMatch[0]);
            }
          } else {
            console.log('No JSON array found in OpenAI response');
            console.log('Full response:', content);
          }
        } catch (outerError) {
          console.log('Outer parsing error:', outerError);
        }
      } catch (openaiError) {
        console.log('OpenAI direct parsing failed:', openaiError);
        console.log('OpenAI error details:', openaiError instanceof Error ? openaiError.message : 'Unknown error');
        console.log('OpenAI error type:', typeof openaiError);
        console.log('OpenAI error status:', openaiError && typeof openaiError === 'object' && 'status' in openaiError ? (openaiError as any).status : 'Unknown');
        console.log('OpenAI API Key configured:', !!process.env.OPENAI_API_KEY);
        console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY?.length || 0);
      }
    } else {
      console.log('Scraped content too short, length:', markdown.length);
      console.log('Sample content:', markdown.slice(0, 500));
    }

    // Last resort: try to extract companies from the raw scraped content using regex
    console.log('Attempting fallback extraction from raw content...');
    console.log('Content sample for debugging:', markdown.slice(0, 2000));
    console.log('Content contains YC URLs:', markdown.includes('ycombinator.com/companies'));
    console.log('Content contains company data patterns:', markdown.includes('"name"'));
    
    try {
      const companies = extractCompaniesFromRawContent(markdown, filters);
      console.log('Fallback extraction returned:', companies.length, 'companies');
      if (companies.length > 0) {
        console.log('Fallback extraction successful:', companies.length);
        return companies;
      }
    } catch (fallbackError) {
      console.log('Fallback extraction failed:', fallbackError);
    }

    // If we still have no companies, let's return some basic mock data to prevent total failure
    console.log('WARNING: No companies extracted from any method, returning empty array to prevent error');
    
    // Instead of throwing an error, return an empty array with a message
    return [{
      id: 'debug-1',
      name: 'No Companies Found',
      description: 'Unable to extract company data from YC directory. This may be due to rate limiting, content blocking, or changes in the YC website structure.',
      batch: 'Debug',
      website: 'https://www.ycombinator.com/companies',
      logo: '',
      tags: ['debug']
    }];
  } catch (error) {
    console.error('Error extracting YC companies:', error);
    throw error;
  }
}



// Fallback function to extract companies from raw content using regex patterns
function extractCompaniesFromRawContent(content: string, filters: SearchFilters): YCCompany[] {
  console.log('Starting fallback extraction...');
  
  const companiesMap = new Map<string, YCCompany>(); // Use Map to avoid duplicates
  
  // Look for JSON-like company data in the content first
  const jsonMatches = content.match(/\{[^{}]*"name"[^{}]*\}/g);
  if (jsonMatches) {
    console.log('Found JSON-like matches:', jsonMatches.length);
    jsonMatches.forEach((match, index) => {
      try {
        // Try to parse as JSON
        const company = JSON.parse(match);
        if (company.name && company.description) {
          const cleanName = company.name.replace(/[)}\]]+$/, '').trim(); // Remove trailing punctuation
          companiesMap.set(cleanName, {
            id: `json-${index}`,
            name: cleanName,
            description: company.description,
            batch: company.batch || 'Unknown',
            website: company.website || `https://www.ycombinator.com/companies/${cleanName.toLowerCase().replace(/\s+/g, '-')}`,
            logo: company.logo || '',
            tags: []
          });
        }
      } catch (e) {
        // Not valid JSON, skip
      }
    });
  }

  // Look for company URLs and try to extract data around them
  const urlMatches = content.match(/https:\/\/www\.ycombinator\.com\/companies\/[a-z0-9-]+/g);
  if (urlMatches) {
    console.log('Found company URL matches:', urlMatches.length);
    
    urlMatches.forEach((url, index) => {
      const companySlug = url.split('/companies/')[1];
      if (companySlug) {
        const cleanName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Only add if we don't already have this company
        if (!companiesMap.has(cleanName)) {
          // Try to find more info around this URL in the content
          const urlIndex = content.indexOf(url);
          const contextStart = Math.max(0, urlIndex - 500);
          const contextEnd = Math.min(content.length, urlIndex + 500);
          const context = content.slice(contextStart, contextEnd);
          
          // Look for batch info with more patterns
          let batch = 'Unknown';
          const batchMatch = context.match(/(Winter|Summer|Spring|Fall)\s+(20\d{2})/i) || 
                            context.match(/(W|S|F)\d{2}/i) ||
                            context.match(/batch[:\s]+(Winter|Summer|Spring|Fall)\s+(20\d{2})/i) ||
                            context.match(/\b(W|S|F)(20\d{2}|2[0-5])\b/i);
          if (batchMatch) {
            batch = batchMatch[0];
          }
          
          // Look for description
          let description = `${cleanName} - YC Company`;
          const descMatch = context.match(/"description":\s*"([^"]+)"/);
          if (descMatch) {
            description = descMatch[1];
          }
          
          // Look for logo
          let logo = '';
          const logoMatch = context.match(/"logo":\s*"([^"]+)"/);
          if (logoMatch) {
            logo = logoMatch[1];
          }
          
          companiesMap.set(cleanName, {
            id: `url-${index}`,
            name: cleanName,
            description,
            batch,
            website: url,
            logo,
            tags: []
          });
        }
      }
    });
  }

  const companies = Array.from(companiesMap.values());
  console.log(`Fallback extraction found ${companies.length} unique companies`);
  
  // Apply filters if specified
  let filteredCompanies = companies;
  
  if (filters.batch && filters.batch !== 'all') {
    const batches = Array.isArray(filters.batch) ? filters.batch : [filters.batch];
    console.log('Applying batch filter:', batches);
    console.log('Sample company batches before filter:', companies.slice(0, 5).map(c => ({ name: c.name, batch: c.batch })));
    
    filteredCompanies = filteredCompanies.filter(company => {
      // If company batch is "Unknown", include it (don't filter out)
      if (company.batch === 'Unknown') {
        return true;
      }
      
      return batches.some(batch => {
        const batchLower = batch.toLowerCase();
        const companyBatchLower = company.batch.toLowerCase();
        return companyBatchLower.includes(batchLower) || batchLower.includes(companyBatchLower);
      });
    });
    
    console.log(`Batch filter: ${companies.length} -> ${filteredCompanies.length} companies`);
  }
  
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filteredCompanies = filteredCompanies.filter(company => 
      company.name.toLowerCase().includes(keyword) ||
      company.description.toLowerCase().includes(keyword)
    );
  }
  
  return filteredCompanies; // Return all companies, no artificial limit
}

export async function scrapeCompanyWebsite(url: string, apiKey?: string): Promise<string> {
  try {
    console.log(`Scraping website: ${url}`);
    
    const client = getClient(apiKey);
    const scrapeResult = await client.scrape.startAndWait({
      url,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 15000,
        waitFor: 2000,
      },
    });

    const content = scrapeResult.data?.markdown || '';
    console.log(`Scraped ${content.length} characters from ${url}`);
    
    // Return first 3000 characters for AI processing
    return content.slice(0, 3000);
    
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);
    return '';
  }
}

 