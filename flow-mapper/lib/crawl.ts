import { Hyperbrowser } from '@hyperbrowser/sdk';
import { FlowGraph, FlowNode } from './graph';

export interface CrawlResult {
  dom: string[];
  endpoints: ApiEndpoint[];
  screenshots: string[];
  crawlId: string;
}

export interface ApiEndpoint {
  url: string;
  method: string;
  payload?: any;
  response?: any;
}

interface CrawlerOptions {
  hbKey: string;
  maxDepth?: number;
  includeApis?: boolean;
}

export class Crawler {
  private client: Hyperbrowser;
  private maxDepth: number;
  private includeApis: boolean;
  private visitedUrls: Set<string>;
  private graph: FlowGraph;
  private endpoints: ApiEndpoint[];

  constructor(options: CrawlerOptions) {
    this.maxDepth = options.maxDepth || 3;
    this.includeApis = options.includeApis || true;
    this.visitedUrls = new Set();
    this.graph = new FlowGraph();
    this.endpoints = [];

    // Initialize Hyperbrowser with API key and debug logging
    console.log(`Initializing Hyperbrowser with API key: ${options.hbKey.substring(0, 8)}...`);
    
    this.client = new Hyperbrowser({
      apiKey: options.hbKey,
      baseUrl: 'https://api.hyperbrowser.ai',
      timeout: 60000, // 60 seconds timeout
    });
  }

  async crawl(startUrl: string): Promise<{ graph: FlowGraph; endpoints: ApiEndpoint[] }> {
    await this.crawlPage(startUrl, 0);
    return { graph: this.graph, endpoints: this.endpoints };
  }

  private async crawlPage(url: string, depth: number): Promise<void> {
    if (depth >= this.maxDepth || this.visitedUrls.has(url)) {
      return;
    }

    this.visitedUrls.add(url);
    console.log(`Crawling ${url} at depth ${depth}`);

    try {
      // Start and wait for scrape job to complete with enterprise features
      console.log(`Making Hyperbrowser API call for ${url}`);
      const result = await this.client.scrape.startAndWait({
        url,
        sessionOptions: {
          useStealth: true,
          useProxy: true,
          enableWebRecording: true,
          saveDownloads: true,
          adblock: true,
          trackers: true,
          annoyances: true,
          acceptCookies: true,
        },
        scrapeOptions: {
          formats: ['html', 'markdown'],
          screenshotOptions: {
            fullPage: true,
          },
          waitUntil: 'networkidle',
        },
      });

      console.log(`Hyperbrowser API response status: ${result.status}`);

      if (result.status === 'completed' && result.data) {
        // Add the page to the graph
        const pageNode: FlowNode = {
          id: Buffer.from(url).toString('base64'),
          type: 'page',
          url,
          label: Array.isArray(result.data.metadata?.title) 
            ? result.data.metadata.title[0] || url
            : result.data.metadata?.title || url,
          screenshot: result.data.screenshot,
        };
        this.graph.addNode(pageNode);

        if (this.includeApis) {
          // Note: Network request extraction is not available in the current scrape API
          // This would require using a different Hyperbrowser service like sessions
          console.log('API extraction not available with scrape service');
        }

        // Extract all links from the page content
        const links = result.data.links || [];
        console.log(`Found ${links.length} links on ${url}`);
        console.log(`Sample links:`, links.slice(0, 5));

        // If no links found from API, try to extract from HTML
        let allLinks = links;
        if (links.length === 0 && result.data.html) {
          console.log('No links from API, extracting from HTML...');
          allLinks = this.extractLinksFromHTML(result.data.html, url);
          console.log(`Extracted ${allLinks.length} links from HTML`);
        }

        // Filter and process links for same domain
        const validLinks = allLinks.filter(link => {
          try {
            const absoluteUrl = new URL(link, url).toString();
            const isSameDomain = absoluteUrl.startsWith(new URL(url).origin);
            const isNotFragment = !link.startsWith('#');
            const isNotMailto = !link.startsWith('mailto:');
            const isNotTel = !link.startsWith('tel:');
            return isSameDomain && isNotFragment && isNotMailto && isNotTel;
          } catch {
            return false;
          }
        });

        console.log(`Found ${validLinks.length} valid same-domain links to crawl`);

        // Recursively crawl linked pages
        for (const link of validLinks.slice(0, 10)) { // Limit to first 10 links per page
          try {
            const absoluteUrl = new URL(link, url).toString();
            console.log(`Attempting to crawl: ${absoluteUrl} at depth ${depth + 1}`);
            
            await this.crawlPage(absoluteUrl, depth + 1);
            
            // Add edge from current page to the linked page
            const targetNodeId = Buffer.from(absoluteUrl).toString('base64');
            this.graph.addEdge(pageNode.id, targetNodeId);
            console.log(`Added edge from ${pageNode.id} to ${targetNodeId}`);
          } catch (error) {
            console.error(`Error processing link ${link}:`, error);
          }
        }
      } else {
        console.error(`Hyperbrowser API failed with status: ${result.status}`);
        if (result.error) {
          console.error(`Hyperbrowser API error: ${result.error}`);
        }
      }

    } catch (error) {
      console.error(`Hyperbrowser API call failed for ${url}:`, error);
      
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }
      
      // Check if it's an authentication error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('NOT AUTHENTICATED') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          console.error('Authentication failed. Please check your Hyperbrowser API key.');
          console.error('Make sure you are using the correct API key format and it has sufficient credits.');
        }
      }
      
      // Re-throw the error so the API route can handle it properly
      throw error;
    }
  }

  private extractLinksFromHTML(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    
    // Simple regex to extract href attributes from anchor tags
    const hrefRegex = /<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = hrefRegex.exec(html)) !== null) {
      const href = match[1];
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        try {
          // Convert relative URLs to absolute
          const absoluteUrl = new URL(href, baseUrl).toString();
          links.push(absoluteUrl);
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    // Remove duplicates
    return Array.from(new Set(links));
  }
} 