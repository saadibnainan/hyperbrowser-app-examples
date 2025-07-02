import { Hyperbrowser } from '@hyperbrowser/sdk'
import { v4 as uuidv4 } from 'uuid'

export interface ScrapedSource {
  url: string
  title: string
  snippet: string
  quote: string
  endpoints: Array<{
    method: string
    url: string
    status: number
    headers: Record<string, string>
    payload?: any
  }>
}

export interface ScrapeResult {
  sources: ScrapedSource[]
  totalEndpoints: number
  creditsUsed: number
}

export async function scrapeSearchResults(
  query: string, 
  hbApiKey: string,
  onProgress?: (progress: number) => void,
  onLog?: (message: string) => void
): Promise<ScrapeResult> {
  const searchQueries = [
    `${query} site:reddit.com`,
    `${query} documentation`,
    `${query} API guide`,
    `${query}`,
  ]
  
  const sources: ScrapedSource[] = []
  let totalCreditsUsed = 0
  
  const hb = new Hyperbrowser({
    apiKey: hbApiKey,
  })
  
  for (let i = 0; i < searchQueries.length; i++) {
    const searchQuery = searchQueries[i]
    onLog?.(`🔍 Searching: ${searchQuery}`)
    
    try {
      // Search using Google
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=10`
      onLog?.(`📖 Scraping search results from: ${googleUrl}`)
      
      const searchResult = await hb.scrape.startAndWait({
        url: googleUrl,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          onlyMainContent: false,
          timeout: 30000,
          waitFor: 3000,
        },
        sessionOptions: {
          useStealth: true,
          adblock: true,
        }
      })
      
      totalCreditsUsed += 1
      onLog?.(`🚀 Scraped search results`)
      
      if (!searchResult.data?.html) {
        onLog?.(`⚠️ No HTML content found for search: ${searchQuery}`)
        continue
      }
      
      // Extract search result links from HTML
      const searchResults = extractSearchResults(searchResult.data.html)
      onLog?.(`📋 Found ${searchResults.length} search results`)
      
      // Process each search result (limit to 2 per query)
      for (let j = 0; j < Math.min(2, searchResults.length); j++) {
        const result = searchResults[j]
        onProgress?.((i * 4 + j + 1) / (searchQueries.length * 4) * 70)
        
        try {
          onLog?.(`🌐 Scraping: ${result.url}`)
          
          // Scrape the actual page
          const pageResult = await hb.scrape.startAndWait({
            url: result.url,
            scrapeOptions: {
              formats: ['markdown'],
              onlyMainContent: true,
              timeout: 20000,
              waitFor: 2000,
            },
            sessionOptions: {
              useStealth: true,
              adblock: true,
            }
          })
          
          totalCreditsUsed += 1
          
          if (!pageResult.data?.markdown) {
            onLog?.(`⚠️ No content found for: ${result.url}`)
            continue
          }
          
          // Extract a meaningful quote from the content
          const quote = extractQuoteFromMarkdown(pageResult.data.markdown)
          
          // For now, we'll simulate endpoint discovery since Hyperbrowser's main focus is content extraction
          // In a real implementation, you might use Hyperbrowser's monitoring features if available
          const mockEndpoints = simulateEndpointDiscovery(result.url)
          
          onLog?.(`🔗 Simulated ${mockEndpoints.length} potential API endpoints`)
          
          sources.push({
            url: result.url,
            title: result.title,
            snippet: result.snippet,
            quote: quote || result.snippet,
            endpoints: mockEndpoints
          })
          
        } catch (error) {
          onLog?.(`⚠️ Failed to scrape ${result.url}: ${error}`)
        }
      }
      
    } catch (error) {
      onLog?.(`❌ Search failed for "${searchQuery}": ${error}`)
    }
  }
  
  const totalEndpoints = sources.reduce((sum, source) => sum + source.endpoints.length, 0)
  
  return {
    sources,
    totalEndpoints,
    creditsUsed: totalCreditsUsed
  }
}

function extractSearchResults(html: string): Array<{ url: string; title: string; snippet: string }> {
  const results: Array<{ url: string; title: string; snippet: string }> = []
  
  try {
    // Simple regex-based extraction of Google search results
    // This is a basic implementation - in production you might want more robust parsing
    const linkRegex = /<a[^>]+href="([^"]+)"[^>]*><h3[^>]*>([^<]+)<\/h3>/gi
    const snippetRegex = /<span[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>([^<]+)<\/span>/gi
    
    let linkMatch
    const links: Array<{ url: string; title: string }> = []
    
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const url = linkMatch[1]
      const title = linkMatch[2]
      
      // Filter out Google internal links
      if (url.startsWith('http') && !url.includes('google.com') && !url.includes('youtube.com')) {
        links.push({ url, title })
      }
    }
    
    // Extract snippets (this is a simplified approach)
    const snippets: string[] = []
    let snippetMatch
    while ((snippetMatch = snippetRegex.exec(html)) !== null) {
      snippets.push(snippetMatch[1])
    }
    
    // Combine links with snippets
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      results.push({
        url: links[i].url,
        title: links[i].title,
        snippet: snippets[i] || 'No snippet available'
      })
    }
    
  } catch (error) {
    console.error('Error extracting search results:', error)
  }
  
  return results
}

function extractQuoteFromMarkdown(markdown: string): string {
  try {
    // Split into paragraphs and find the first meaningful one
    const paragraphs = markdown.split('\n\n').filter(p => p.trim().length > 50)
    
    if (paragraphs.length > 0) {
      // Take the first substantial paragraph
      let quote = paragraphs[0].trim()
      
      // Remove markdown formatting
      quote = quote.replace(/[#*`]/g, '')
      
      // Limit length
      if (quote.length > 200) {
        quote = quote.substring(0, 200) + '...'
      }
      
      return quote
    }
    
    return 'Content extracted from page'
  } catch (error) {
    return 'Content extracted from page'
  }
}

function simulateEndpointDiscovery(url: string): Array<{
  method: string
  url: string
  status: number
  headers: Record<string, string>
  payload?: any
}> {
  // Since we're using Hyperbrowser for content extraction, we'll simulate common API patterns
  // based on the domain and URL structure
  const endpoints: Array<{
    method: string
    url: string
    status: number
    headers: Record<string, string>
    payload?: any
  }> = []
  
  try {
    const domain = new URL(url).hostname
    const baseDomain = domain.replace('www.', '')
    
    // Common API patterns based on the type of site
    if (domain.includes('github.com')) {
      endpoints.push({
        method: 'GET',
        url: `https://api.github.com/repos/${url.split('/').slice(-2).join('/')}`,
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    } else if (domain.includes('stackoverflow.com')) {
      endpoints.push({
        method: 'GET',
        url: `https://api.stackexchange.com/2.3/questions`,
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    } else if (domain.includes('reddit.com')) {
      endpoints.push({
        method: 'GET',
        url: `https://www.reddit.com/api/info.json`,
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    } else {
      // Generic API endpoints that might exist
      const commonPaths = ['/api/v1/', '/api/', '/graphql', '/rest/']
      const randomPath = commonPaths[Math.floor(Math.random() * commonPaths.length)]
      
      endpoints.push({
        method: 'GET',
        url: `https://${baseDomain}${randomPath}`,
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
  } catch (error) {
    // If URL parsing fails, add a generic endpoint
    endpoints.push({
      method: 'GET',
      url: `${url}/api/`,
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  }
  
  return endpoints
} 