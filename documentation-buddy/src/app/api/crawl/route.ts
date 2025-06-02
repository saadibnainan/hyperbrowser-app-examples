import { Hyperbrowser } from "@hyperbrowser/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const crawlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
  maxPages: z.number().min(1).max(200).optional().default(50),
  apiKey: z.string().min(1, "API key is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { url } = crawlSchema.parse(body);
    const { maxPages, apiKey } = crawlSchema.parse(body);

    // Normalize URL by adding https:// if no protocol is specified
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }

    // Use the provided API key
    const client = new Hyperbrowser({
      apiKey: apiKey,
    });

    // Smart URL detection - try to find the actual docs URL if a main domain is provided
    const crawlUrl = await findDocumentationUrl(client, url);
    
    console.log(`Original URL: ${url}, Crawling URL: ${crawlUrl}`);

    // Crawl the documentation site
    const crawlResult = await client.crawl.startAndWait({
      url: crawlUrl,
      maxPages: maxPages,
      includePatterns: [
        "/docs/*",
        "/documentation/*", 
        "/api/*",
        "/guide/*",
        "/guides/*",
        "/tutorial/*",
        "/tutorials/*",
        "/reference/*",
        "/manual/*",
        "/help/*",
        "/learn/*",
        "/getting-started/*",
        "/quickstart/*"
      ],
      excludePatterns: [
        "/blog/*",
        "/news/*",
        "/events/*",
        "/about/*",
        "/contact/*",
        "/pricing/*",
        "/login/*",
        "/signup/*",
        "/dashboard/*"
      ],
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
        excludeTags: [
          "nav", 
          "footer", 
          "aside", 
          ".navigation", 
          ".sidebar", 
          ".header",
          ".footer",
          ".breadcrumb",
          ".toc",
          "header",
          "[role='navigation']",
          "[role='banner']",
          "[role='contentinfo']"
        ],
        waitFor: 3000, // Wait longer for JS to render
      },
      sessionOptions: {
        useStealth: true,
      },
    });

    // Process and filter the crawled data
    const processedPages = crawlResult.data
      ?.filter(page => {
        // Only include successfully crawled pages with meaningful content
        return page.status === 'completed' && 
               page.markdown && 
               page.markdown.trim().length > 100 && // Minimum content length
               !isLandingOrHomePage(page.url) // Exclude landing pages
      })
      .map(page => ({
        url: page.url,
        title: page.metadata?.title as string || extractTitleFromUrl(page.url),
        content: cleanMarkdownContent(page.markdown || ''),
        status: page.status as 'completed' | 'failed',
      }))
      .sort((a, b) => {
        // Prioritize documentation pages
        const aScore = getDocumentationScore(a.url, a.title);
        const bScore = getDocumentationScore(b.url, b.title);
        return bScore - aScore;
      }) || [];

    if (processedPages.length === 0) {
      return NextResponse.json(
        { 
          error: "No documentation content found. Please make sure you're using a valid documentation URL.",
          suggestion: "Try using a direct link to the documentation section (e.g., https://example.com/docs)"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: crawlUrl,
        originalUrl: url,
        pages: processedPages,
        totalPages: processedPages.length,
        crawledAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Crawl error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    // Handle specific API key errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your Hyperbrowser API key." },
          { status: 401 }
        );
      }
      if (error.message.includes('403') || error.message.includes('forbidden')) {
        return NextResponse.json(
          { error: "API key doesn't have sufficient permissions or quota exceeded." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to crawl documentation" },
      { status: 500 }
    );
  }
}

async function findDocumentationUrl(client: Hyperbrowser, originalUrl: string): Promise<string> {
  try {
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;
    
    // If already a docs URL, use it directly
    if (isDocumentationUrl(pathname) || isDocumentationSubdomain(urlObj.hostname)) {
      return originalUrl;
    }
    
    // If it's a root/landing page, try to find docs
    if (pathname === '/' || pathname === '') {
      
      // First, try subdomain-based documentation
      const subdomainResults = await tryDocumentationSubdomains(client, urlObj);
      if (subdomainResults) {
        return subdomainResults;
      }
      
      // Then try path-based documentation
      const pathResults = await tryDocumentationPaths(client, urlObj);
      if (pathResults) {
        return pathResults;
      }
    }
    
    // If no docs found, return original URL
    return originalUrl;
  } catch (error) {
    console.error("Error finding documentation URL:", error);
    return originalUrl;
  }
}

async function tryDocumentationSubdomains(client: Hyperbrowser, urlObj: URL): Promise<string | null> {
  const commonSubdomains = [
    'docs',
    'documentation', 
    'api',
    'developer',
    'dev',
    'help',
    'support',
    'guide',
    'manual',
    'learn'
  ];
  
  // Extract base domain (remove any existing subdomain)
  const hostParts = urlObj.hostname.split('.');
  let baseDomain: string;
  
  if (hostParts.length >= 2) {
    // Handle cases like docs.example.com -> example.com
    // or api.docs.example.com -> example.com
    if (hostParts.length === 2) {
      baseDomain = urlObj.hostname; // already base domain
    } else {
      // Take last 2 parts as base domain (handles .co.uk, .com.au, etc.)
      baseDomain = hostParts.slice(-2).join('.');
    }
  } else {
    baseDomain = urlObj.hostname;
  }
  
  for (const subdomain of commonSubdomains) {
    const testUrl = `${urlObj.protocol}//${subdomain}.${baseDomain}`;
    
    try {
      console.log(`Testing subdomain: ${testUrl}`);
      
      const testResult = await client.scrape.startAndWait({
        url: testUrl,
        scrapeOptions: {
          formats: ["markdown"],
          timeout: 8000,
          waitFor: 1000,
        }
      });
      
      if (testResult.data?.markdown && testResult.data.markdown.length > 200) {
        // Additional check to see if this looks like documentation
        const content = testResult.data.markdown.toLowerCase();
        const docKeywords = ['documentation', 'getting started', 'api reference', 'guide', 'tutorial', 'installation', 'overview'];
        const hasDocKeywords = docKeywords.some(keyword => content.includes(keyword));
        
        if (hasDocKeywords || content.length > 1000) {
          console.log(`Found documentation at subdomain: ${testUrl}`);
          return testUrl;
        }
      }
    } catch (error) {
      console.log(`Subdomain ${testUrl} failed:`, (error as Error).message);
      continue;
    }
  }
  
  return null;
}

async function tryDocumentationPaths(client: Hyperbrowser, urlObj: URL): Promise<string | null> {
  const commonDocsPaths = [
    '/docs',
    '/documentation', 
    '/api',
    '/guide',
    '/guides',
    '/learn',
    '/getting-started',
    '/manual',
    '/help',
    '/developers',
    '/dev'
  ];
  
  for (const docsPath of commonDocsPaths) {
    const testUrl = `${urlObj.origin}${docsPath}`;
    
    try {
      console.log(`Testing path: ${testUrl}`);
      
      const testResult = await client.scrape.startAndWait({
        url: testUrl,
        scrapeOptions: {
          formats: ["markdown"],
          timeout: 8000,
          waitFor: 1000,
        }
      });
      
      if (testResult.data?.markdown && testResult.data.markdown.length > 200) {
        console.log(`Found documentation at path: ${testUrl}`);
        return testUrl;
      }
    } catch (error) {
      console.log(`Path ${testUrl} failed:`, (error as Error).message);
      continue;
    }
  }
  
  return null;
}

function isDocumentationUrl(pathname: string): boolean {
  const docPatterns = [
    '/docs',
    '/documentation', 
    '/api',
    '/guide',
    '/guides',
    '/tutorial',
    '/tutorials',
    '/reference',
    '/manual',
    '/help',
    '/learn',
    '/getting-started',
    '/quickstart'
  ];
  
  return docPatterns.some(pattern => pathname.startsWith(pattern));
}

function isLandingOrHomePage(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Check if it's a home/landing page
    const landingPatterns = [
      '/',
      '/home',
      '/index',
      '/landing'
    ];
    
    return landingPatterns.includes(pathname) || pathname === '';
  } catch {
    return false;
  }
}

function getDocumentationScore(url: string, title: string): number {
  let score = 0;
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Higher score for documentation-specific paths
  if (urlLower.includes('/docs/')) score += 10;
  if (urlLower.includes('/api/')) score += 8;
  if (urlLower.includes('/guide')) score += 7;
  if (urlLower.includes('/tutorial')) score += 6;
  if (urlLower.includes('/reference')) score += 8;
  if (urlLower.includes('/getting-started')) score += 9;
  
  // Higher score for documentation-specific titles
  if (titleLower.includes('documentation')) score += 5;
  if (titleLower.includes('guide')) score += 4;
  if (titleLower.includes('tutorial')) score += 3;
  if (titleLower.includes('api')) score += 4;
  if (titleLower.includes('reference')) score += 4;
  if (titleLower.includes('getting started')) score += 5;
  
  return score;
}

function cleanMarkdownContent(content: string): string {
  // Remove excessive whitespace and clean up the content
  return content
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace
    .replace(/\[.*?\]\(javascript:.*?\)/g, '') // Remove javascript links
    .replace(/\[.*?\]\(#.*?\)/g, '') // Remove anchor links
    .trim();
}

function extractTitleFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Home';
    
    // Convert kebab-case or snake_case to title case
    return lastSegment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  } catch {
    return 'Documentation Page';
  }
}

function isDocumentationSubdomain(hostname: string): boolean {
  const docSubdomains = [
    'docs.',
    'documentation.',
    'api.',
    'developer.',
    'dev.',
    'help.',
    'support.',
    'guide.',
    'manual.',
    'learn.'
  ];
  
  return docSubdomains.some(subdomain => hostname.startsWith(subdomain));
} 