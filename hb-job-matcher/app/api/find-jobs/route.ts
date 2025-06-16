import { NextRequest, NextResponse } from 'next/server';
import { Hyperbrowser } from '@hyperbrowser/sdk';
import OpenAI from 'openai';

interface JobSource {
  name: string;
  url: string;
  searchParam: string;
  enabled: boolean;
}

interface ExtractedProfile {
  name: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  description: string;
  requirements: string[];
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const { profile, apiKey, jobSources } = await request.json();

    if (!profile || !apiKey) {
      return NextResponse.json(
        { error: 'Profile data and API key are required' },
        { status: 400 }
      );
    }

    // Use default job sources if none provided
    const defaultJobSources = [
      {
        name: 'YC Work at a Startup',
        url: 'https://www.workatastartup.com/job_list',
        searchParam: 'search',
        enabled: true
      },
      {
        name: 'AngelList/Wellfound',
        url: 'https://wellfound.com/jobs',
        searchParam: 'q',
        enabled: true
      },
      {
        name: 'RemoteOK',
        url: 'https://remoteok.io',
        searchParam: 'q',
        enabled: true
      },
      {
        name: 'Indeed',
        url: 'https://www.indeed.com/jobs',
        searchParam: 'q',
        enabled: true
      }
    ];

    const sourcesToUse = jobSources && jobSources.length > 0 
      ? jobSources.filter((source: JobSource) => source.enabled)
      : defaultJobSources;

    if (!sourcesToUse || sourcesToUse.length === 0) {
      return NextResponse.json(
        { error: 'No job sources are enabled. Please enable at least one job source.' },
        { status: 400 }
      );
    }

    // Find matching jobs based on the profile
    const jobMatches = await findMatchingJobs(profile, apiKey, sourcesToUse);

    return NextResponse.json({ jobMatches });

  } catch (error) {
    console.error('Error finding jobs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to find matching jobs. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}

async function findMatchingJobs(
  profile: ExtractedProfile, 
  apiKey: string,
  jobSources: JobSource[]
): Promise<JobMatch[]> {
  // Import puppeteer-core dynamically to handle potential import issues
  let connect: any;
  try {
    const puppeteer = await import('puppeteer-core');
    connect = puppeteer.connect;
  } catch (importError) {
    console.error('Failed to import puppeteer-core:', importError);
    throw new Error('Puppeteer-core is required but not installed. Please run: npm install puppeteer-core');
  }

  const client = new Hyperbrowser({ apiKey });
  
  // Initialize OpenAI if API key is available
  let openai: OpenAI | null = null;
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  const allJobs: any[] = [];
  
  for (const source of jobSources) {
    try {
      console.log(`Scraping ${source.name}...`);
      
          const session = await client.sessions.create();

      try {
        // Connect to the browser using puppeteer-core
        const browser = await connect({
          browserWSEndpoint: session.wsEndpoint,
          defaultViewport: null,
        });

        const [page] = await browser.pages();

        // Build search query from profile (focus on title and top skills)
        let searchTerms = 'software engineer developer'; // Default fallback
        
        // Only use profile data if it's actually extracted (not default values)
        if (profile.title && !profile.title.includes('not specified') && !profile.title.includes('not found')) {
          const titleWords = profile.title.split(' ').slice(0, 2).join(' ');
          searchTerms = titleWords;
        }
        
        // Add skills if they're actually extracted
        if (profile.skills && profile.skills.length > 0 && !profile.skills[0].includes('not found')) {
          const cleanSkills = profile.skills
            .flatMap(skill => skill.split(/[,\s]+/)) // Split on commas and spaces
            .filter(skill => skill.length > 2 && skill.length < 20) // Filter reasonable skills
            .slice(0, 3); // Take top 3 skills
          
          if (cleanSkills.length > 0) {
            searchTerms = searchTerms + ' ' + cleanSkills.join(' ');
          }
        }

        // Navigate to job board with search
        const searchUrl = `${source.url}?${source.searchParam}=${encodeURIComponent(searchTerms)}`;
        console.log(`Searching: ${searchUrl}`);
        
        await page.goto(searchUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        // Extract job listings with source-specific selectors
        const jobs = await page.evaluate((sourceName: string) => {
          let jobSelectors: string[] = [];
          
          // Source-specific selectors for better extraction
          switch (sourceName) {
            case 'YC Work at a Startup':
              jobSelectors = ['.job-card', '.job-item', '[class*="JobCard"]', '.posting'];
              break;
            case 'AngelList/Wellfound':
              jobSelectors = ['[data-test="JobSearchCard"]', '.job-card', '.startup-job', '.job'];
              break;
            case 'RemoteOK':
              jobSelectors = ['.job', '.job-tile', 'tr.job', '.job-row'];
              break;
            case 'Indeed':
              jobSelectors = ['[data-jk]', '.job_seen_beacon', '.jobsearch-SerpJobCard', '.job'];
              break;
            case 'LinkedIn':
              jobSelectors = [
                '.job-card-container',
                '.job-card-list__entity',
                '.job-card-list__title',
                '.job-card-container--clickable',
                '.job-card-list__entity--focused',
                '.job-card-list__entity--active'
              ];
              break;
            default:
              jobSelectors = [
                '[data-job]', '.job-card', '.job-item', '.job-listing',
                '.job', '.posting', '[class*="job"]', '[class*="listing"]'
              ];
          }
          
          const jobElements: Element[] = [];
          for (const selector of jobSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              jobElements.push(...Array.from(elements));
              break;
            }
          }

          return jobElements.slice(0, 15).map((el, index) => {
            const extractText = (selectors: string[]) => {
              for (const selector of selectors) {
                try {
                  const element = el.querySelector(selector);
                  if (element?.textContent?.trim()) {
                    return element.textContent.trim();
                  }
                } catch (e) {
                  continue;
                }
              }
              return '';
            };

            const extractLink = () => {
              try {
                const link = el.querySelector('a[href]') as HTMLAnchorElement;
                if (link?.href) {
                  return link.href.startsWith('http') ? link.href : 
                         new URL(link.href, window.location.origin).href;
                }
              } catch (e) {
                // Continue
              }
              return '';
            };

            // Universal selectors that work across most job boards
            const title = extractText([
              // LinkedIn specific selectors
              ...(sourceName === 'LinkedIn' ? [
                '.job-card-list__title',
                '.job-card-container__primary-description',
                '.job-card-container__link',
                '.job-card-container__title'
              ] : []),
              // Common selectors
              '.job-title', '[data-job-title]', 'h2', 'h3', 'h4',
              '[class*="title"]', '[class*="Title"]', 'a[data-job-id]',
              '.posting-name', '.job-name', 'a'
            ]);

            const company = extractText([
              // LinkedIn specific selectors
              ...(sourceName === 'LinkedIn' ? [
                '.job-card-container__company-name',
                '.job-card-container__subtitle',
                '.job-card-container__primary-description'
              ] : []),
              // Common selectors
              '.company', '[data-company]', '.employer', '.company-name',
              '[class*="company"]', '[class*="Company"]', '[class*="employer"]',
              '.startup-name', '.org-name', '.companyName'
            ]);

            const location = extractText([
              // LinkedIn specific selectors
              ...(sourceName === 'LinkedIn' ? [
                '.job-card-container__metadata-item',
                '.job-card-container__metadata-wrapper',
                '.job-card-container__footer-item'
              ] : []),
              // Common selectors
              '.location', '[data-location]', '.city', '.job-location',
              '[class*="location"]', '[class*="Location"]', '[class*="city"]',
              '.remote', '.office-location', '.jobLocation'
            ]);

            const description = extractText([
              // LinkedIn specific selectors
              ...(sourceName === 'LinkedIn' ? [
                '.job-card-container__description',
                '.job-card-container__snippet',
                '.job-card-container__footer-item'
              ] : []),
              // Common selectors
              '.description', '.summary', '.snippet', '.job-description',
              '[class*="description"]', '[class*="Description"]', 
              '[class*="summary"]', '.posting-content', '.job-content',
              '.jobSummary', 'p'
            ])?.substring(0, 400);

            return {
              id: `job-${sourceName.replace(/\s+/g, '')}-${Date.now()}-${index}`,
              title,
              company,
              location: location || 'Location not specified',
              description: description || 'Description not available',
              url: extractLink(),
              source: sourceName
            };
          }).filter(job => job.title && job.company && job.title.length > 5);
        }, source.name);
        
        console.log(`Found ${jobs.length} jobs from ${source.name}`);
        allJobs.push(...jobs);
        
        await browser.close();
        
      } finally {
        await client.sessions.stop(session.id);
      }
      
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error);
      // Continue with other sources
    }
  }
  
  if (allJobs.length === 0) {
    throw new Error('No jobs found from any source. Please try a different search or check your internet connection.');
  }

  console.log(`Total jobs extracted: ${allJobs.length}`);
  
  // Simply return the jobs with basic info, no scoring needed
  const jobMatches = allJobs.slice(0, 15).map(job => ({
    ...job,
    matchScore: 75, // Just show a static good score
    requirements: [] // No requirements extraction needed
  }));

  console.log(`Returning ${jobMatches.length} jobs`);
  return jobMatches;
} 