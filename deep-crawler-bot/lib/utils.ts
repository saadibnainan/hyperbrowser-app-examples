interface ApiEndpoint {
  method: string
  url: string
  status: number
  size: number
}

export function dedupeEndpoints(endpoints: ApiEndpoint[]): ApiEndpoint[] {
  const seen = new Set<string>()
  const unique: ApiEndpoint[] = []

  for (const endpoint of endpoints) {
    const key = `${endpoint.method}:${endpoint.url}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(endpoint)
    }
  }

  return unique.sort((a, b) => {
    // Sort by method first, then by URL
    if (a.method !== b.method) {
      return a.method.localeCompare(b.method)
    }
    return a.url.localeCompare(b.url)
  })
}

export function generatePostmanCollection(originalUrl: string, endpoints: ApiEndpoint[]) {
  const hostname = new URL(originalUrl).hostname
  const collectionName = `DeepCrawler - ${hostname}`

  const collection = {
    info: {
      name: collectionName,
      description: `API endpoints discovered by DeepCrawler from ${originalUrl}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: endpoints.map((endpoint, index) => {
      const url = new URL(endpoint.url)
      const pathSegments = url.pathname.split('/').filter(Boolean)
      const name = pathSegments.length > 0 
        ? pathSegments[pathSegments.length - 1] || 'root'
        : 'root'

      return {
        name: `${endpoint.method} ${name}`,
        request: {
          method: endpoint.method,
          header: [
            {
              key: 'Accept',
              value: 'application/json',
              type: 'text'
            },
            {
              key: 'User-Agent',
              value: 'DeepCrawler/1.0',
              type: 'text'
            }
          ],
          url: {
            raw: endpoint.url,
            protocol: url.protocol.slice(0, -1),
            host: url.hostname.split('.'),
            port: url.port || (url.protocol === 'https:' ? '443' : '80'),
            path: pathSegments,
            query: url.search ? url.search.slice(1).split('&').map(param => {
              const [key, value = ''] = param.split('=')
              return { key: decodeURIComponent(key), value: decodeURIComponent(value) }
            }) : []
          },
          description: `Status: ${endpoint.status}, Size: ${endpoint.size} bytes`
        },
        response: []
      }
    }),
    variable: []
  }

  return collection
}

export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return 'unknown-host'
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function isApiUrl(url: string): boolean {
  const apiPatterns = [
    /\/api\//i,
    /\/v\d+\//i,
    /\.json(\?|$)/i,
    /\/graphql/i,
    /\/rest\//i,
    /\/endpoints?\//i
  ]
  
  return apiPatterns.some(pattern => pattern.test(url))
} 