import { Hyperbrowser } from '@hyperbrowser/sdk'

if (!process.env.HYPERBROWSER_API_KEY) {
  throw new Error('HYPERBROWSER_API_KEY environment variable is required')
}

export const hb = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
})

export interface CrawlOptions {
  url: string
  timeout?: number
  stealth?: boolean
  proxy?: 'residential' | 'datacenter' | false
}

export interface ApiEndpoint {
  method: string
  url: string
  status: number
  size: number
  timestamp?: number
}

export const defaultCrawlOptions: Partial<CrawlOptions> = {
  timeout: 60000,
  stealth: true,
  proxy: 'residential'
} 