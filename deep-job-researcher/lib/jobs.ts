import { withClient } from './hb';

export interface JobListing {
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  url: string;
  description: string;
  source: string;
}

export interface JobSource {
  name: string;
  url: string;
  depth: number;
  selector?: string;
}

const JOB_SOURCES: JobSource[] = [
  {
    name: 'Work at a Startup',
    url: 'https://www.workatastartup.com/jobs',
    depth: 2,
  },
];

export async function crawlJobSources(
  onProgress?: (message: string) => void
): Promise<JobListing[]> {
  const allJobs: JobListing[] = [];

  for (const source of JOB_SOURCES) {
    try {
      onProgress?.(`[CRAWL] Starting ${source.name}...`);
      
      const jobs = await withClient(async (client) => {
        const result = await client.crawl.startAndWait({
          url: source.url,
          maxPages: 10,
          scrapeOptions: {
            formats: ['markdown', 'html'],
          },
        });

        onProgress?.(`[CRAWL] ${source.name} - ${result.status || 'completed'} - ${result.data?.length || 0} pages`);
        
        return parseJobsFromCrawlResult(result, source);
      });

      allJobs.push(...jobs);
      onProgress?.(`[PARSE] Extracted ${jobs.length} jobs from ${source.name}`);
      
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error);
      onProgress?.(`[ERROR] Failed to crawl ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  onProgress?.(`[COMPLETE] Total jobs found: ${allJobs.length}`);
  return allJobs;
}

function parseJobsFromCrawlResult(crawlResult: any, source: JobSource): JobListing[] {
  const jobs: JobListing[] = [];
  
  if (!crawlResult.data) {
    return jobs;
  }

  for (const page of crawlResult.data) {
    const content = page.markdown || page.html;
    if (!content) continue;

    const pageJobs = extractJobsFromHTML(content, page.metadata?.url || source.url, source);
    jobs.push(...pageJobs);
  }

  return jobs;
}

function extractJobsFromHTML(content: string, pageUrl: string, source: JobSource): JobListing[] {
  const jobs: JobListing[] = [];
  
  // Check if content is markdown or HTML
  const isMarkdown = !content.includes('<html') && !content.includes('<!DOCTYPE');
  
  if (isMarkdown) {
    // Parse markdown content (preferred for Work at a Startup)
    const lines = content.split('\n');
    let currentJob: Partial<JobListing> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for job titles (markdown headers or links)
      const titleMatch = line.match(/^#{1,6}\s*(.+)$/) || line.match(/^\[([^\]]+)\]/);
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/); // Extract [title](url) format
      
      if (titleMatch && isJobTitle(titleMatch[1])) {
        // Save previous job if complete
        if (currentJob.title && currentJob.company) {
          jobs.push({
            title: currentJob.title,
            company: currentJob.company,
            url: currentJob.url || pageUrl,
            description: currentJob.description || 'No description available',
            source: source.name,
            remote: currentJob.remote,
            location: currentJob.location,
          });
        }
        
        // Start new job
        let jobUrl = pageUrl;
        let jobTitle = titleMatch[1].trim();
        
        // If it's a markdown link, extract the URL
        if (linkMatch) {
          jobTitle = linkMatch[1].trim();
          jobUrl = linkMatch[2].trim();
          
          // Make sure URL is absolute
          if (jobUrl.startsWith('/')) {
            const baseUrl = new URL(pageUrl).origin;
            jobUrl = baseUrl + jobUrl;
          }
        }
        
        currentJob = {
          title: jobTitle,
          url: jobUrl,
        };
        
        // Look for company info in next few lines
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('*')) {
            // Extract company name (remove markdown formatting)
            const company = nextLine.replace(/[\*_\[\]()]/g, '').trim();
            if (company.length > 1 && company.length < 50) {
              currentJob.company = company;
              break;
            }
          }
        }
        
        // Extract description from surrounding context
        const descLines = lines.slice(i + 1, Math.min(i + 10, lines.length));
        currentJob.description = descLines
          .filter(l => l.trim() && !l.startsWith('#'))
          .join(' ')
          .replace(/[\*_\[\]]/g, '')
          .substring(0, 200);
          
        currentJob.remote = /remote|anywhere|distributed/i.test(content);
        currentJob.location = extractLocationFromText(content);
      }
    }
    
    // Don't forget the last job
    if (currentJob.title && currentJob.company) {
      jobs.push({
        title: currentJob.title,
        company: currentJob.company,
        url: currentJob.url || pageUrl,
        description: currentJob.description || 'No description available',
        source: source.name,
        remote: currentJob.remote,
        location: currentJob.location,
      });
    }
  } else {
    // Parse HTML content (fallback)
    const jobPatterns = [
      // Work at a Startup patterns with links
      /<a[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?<h[1-6][^>]*>([^<]+)<\/h[1-6]>[\s\S]*?<\/a>/gi,
      /<div[^>]*job[^>]*>[\s\S]*?<h[1-6][^>]*>([^<]+)<\/h[1-6]>[\s\S]*?company[^>]*>([^<]+)<[\s\S]*?<\/div>/gi,
      /<article[^>]*>[\s\S]*?<h[1-6][^>]*>([^<]+)<\/h[1-6]>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<\/article>/gi,
      // Generic patterns
      /<div[^>]*role[^>]*>[\s\S]*?<h[1-6][^>]*>([^<]+)<\/h[1-6]>[\s\S]*?<span[^>]*>([^<]+)<\/span>[\s\S]*?<\/div>/gi,
    ];

    for (const pattern of jobPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let title, company, jobUrl = pageUrl;
        
        // Check if first capture group is URL (link pattern)
        if (match[1] && match[1].includes('/')) {
          jobUrl = match[1];
          title = match[2]?.trim();
          company = extractCompanyFromJobContent(content, title);
          
          // Make URL absolute if relative
          if (jobUrl.startsWith('/')) {
            const baseUrl = new URL(pageUrl).origin;
            jobUrl = baseUrl + jobUrl;
          }
        } else {
          // Regular pattern
          title = match[1]?.trim();
          company = match[2]?.trim();
        }
        
        if (title && title.length > 3 && isJobTitle(title)) {
          jobs.push({
            title,
            company: company || source.name,
            url: jobUrl,
            description: extractJobDescription(content, title),
            source: source.name,
            remote: /remote|anywhere|distributed/i.test(content),
            location: extractLocation(content),
          });
        }
      }
    }

    // If no jobs found with patterns, try a more generic approach
    if (jobs.length === 0) {
      const titleMatches = content.match(/<h[1-6][^>]*>([^<]{10,100})<\/h[1-6]>/gi);
      if (titleMatches) {
        titleMatches.slice(0, 10).forEach((match, index) => {
          const title = match.replace(/<[^>]*>/g, '').trim();
          if (title && isJobTitle(title)) {
            jobs.push({
              title,
              company: source.name,
              url: pageUrl,
              description: `Job posting from ${source.name}`,
              source: source.name,
            });
          }
        });
      }
    }
  }

  return jobs.slice(0, 20); // Limit to 20 jobs per source
}

function extractJobDescription(html: string, title: string): string {
  // Try to find description near the title
  const titleIndex = html.toLowerCase().indexOf(title.toLowerCase());
  if (titleIndex === -1) return 'No description available';
  
  const surrounding = html.substring(titleIndex, titleIndex + 500);
  const cleanText = surrounding.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  return cleanText.substring(0, 200) + (cleanText.length > 200 ? '...' : '');
}

function extractLocation(html: string): string | undefined {
  const locationPattern = /(?:location|based|office)[^>]*>([^<]+)</gi;
  const match = locationPattern.exec(html);
  return match?.[1]?.trim();
}

function extractLocationFromText(text: string): string | undefined {
  const locationPatterns = [
    /(?:location|based|office)[\s:]*([^\n\r\|]{1,50})/gi,
    /(?:remote|san francisco|new york|london|berlin|toronto|seattle|austin|boston|chicago|los angeles|miami|denver)/gi,
  ];
  
  for (const pattern of locationPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1]?.trim() || match[0]?.trim();
    }
  }
  
  return undefined;
}

function extractCompanyFromJobContent(content: string, jobTitle: string): string {
  // Look for company name near the job title
  const titleIndex = content.toLowerCase().indexOf(jobTitle.toLowerCase());
  if (titleIndex === -1) return 'Unknown Company';
  
  // Search in surrounding text
  const surrounding = content.substring(
    Math.max(0, titleIndex - 200), 
    titleIndex + jobTitle.length + 200
  );
  
  // Common company name patterns
  const companyPatterns = [
    /company:\s*([^\n\r]{1,50})/gi,
    /at\s+([A-Z][a-zA-Z\s&\.]{2,30})/g,
    /\b([A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]*)*)\s+(?:is|seeks|hiring)/g,
  ];
  
  for (const pattern of companyPatterns) {
    const match = pattern.exec(surrounding);
    if (match && match[1]) {
      const company = match[1].trim();
      if (company.length > 2 && company.length < 40) {
        return company;
      }
    }
  }
  
  return 'Unknown Company';
}

function isJobTitle(text: string): boolean {
  const jobKeywords = [
    'engineer', 'developer', 'designer', 'manager', 'analyst', 'specialist',
    'consultant', 'architect', 'lead', 'senior', 'junior', 'intern',
    'frontend', 'backend', 'fullstack', 'devops', 'qa', 'data',
    'product', 'marketing', 'sales', 'support', 'operations'
  ];
  
  const lowerText = text.toLowerCase();
  return jobKeywords.some(keyword => lowerText.includes(keyword));
} 