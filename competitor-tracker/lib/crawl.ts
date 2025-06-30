import { Hyperbrowser } from '@hyperbrowser/sdk'

if (!process.env.HYPERBROWSER_API_KEY) {
  throw new Error('HYPERBROWSER_API_KEY env var is required')
}

const hb = new Hyperbrowser({ apiKey: process.env.HYPERBROWSER_API_KEY })

export interface CrawlResult {
  html: string
}

export async function crawl(url: string): Promise<CrawlResult> {
  const scrape = await hb.scrape.startAndWait({
    url,
    scrapeOptions: {
      formats: ['html'],
      timeout: 60000,
      waitFor: 5000,
    },
    sessionOptions: {
      useStealth: true,
      adblock: true,
    },
  })

  if (!scrape.data?.html) {
    throw new Error('Failed to crawl page - missing HTML data')
  }

  return {
    html: scrape.data.html,
  }
} 