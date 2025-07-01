import { NextRequest, NextResponse } from 'next/server'
import { Crawler } from '@/lib/crawl'
import { GraphBuilder } from '@/lib/graph'
import { CodeGenerator } from '@/lib/codegen'
import { ZipBuilder } from '@/lib/zip'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (type: string, data: any) => {
        const message = `data: ${JSON.stringify({ type, ...data })}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      try {
        // Parse request body
        const body = await request.json()
        const { hbKey, url, maxDepth = 2, includeApis = true } = body

        // Validate input
        if (!hbKey || !url) {
          sendEvent('error', { message: 'Missing required parameters: hbKey and url' })
          controller.close()
          return
        }

        // Validate URL format
        try {
          new URL(url)
        } catch {
          sendEvent('error', { message: 'Invalid URL format' })
          controller.close()
          return
        }

        sendEvent('log', { message: 'Initializing crawler...' })
        sendEvent('progress', { progress: 10 })

        // Initialize crawler
        const crawler = new Crawler({
          hbKey,
          maxDepth,
          includeApis
        })
        
        try {
          // Start crawling
          sendEvent('log', { message: `Starting crawl of ${url} with depth ${maxDepth}` })
          const { graph, endpoints } = await crawler.crawl(url)

          sendEvent('log', { message: `Crawl completed. Found ${endpoints.length} API endpoints` })
          sendEvent('progress', { progress: 60 })

          // Generate code
          sendEvent('log', { message: 'Generating Playwright and React code...' })
          const codeGenerator = new CodeGenerator()
          const codeResult = codeGenerator.generateCode(graph, endpoints, url)

          sendEvent('progress', { progress: 85 })

          // Create zip files
          sendEvent('log', { message: 'Creating downloadable packages...' })
          const zipBuilder = new ZipBuilder()
          
          const playwrightZip = await zipBuilder.createPlaywrightZip(codeResult.playwrightCode, url)
          let reactZip = null
          
          if (includeApis) {
            reactZip = await zipBuilder.createReactZip(codeResult.reactCode)
          }

          sendEvent('log', { message: 'All files generated successfully!' })
          sendEvent('progress', { progress: 100 })

          // Send final result
          sendEvent('complete', {
            result: {
              graph: {
                nodes: graph.nodes,
                edges: graph.edges,
                mermaidSyntax: graph.mermaidSyntax
              },
              endpoints,
              playwrightZip: playwrightZip.buffer.toString('base64'),
              reactZip: reactZip ? reactZip.buffer.toString('base64') : null,
              postmanJson: codeResult.postmanCollection,
              stats: {
                totalPages: graph.nodes.filter(n => n.type === 'page').length,
                totalEndpoints: endpoints.length,
                totalScreenshots: graph.nodes.filter(n => n.screenshot).length,
                crawlDepth: maxDepth
              }
            }
          })

        } catch (crawlError) {
          console.error('Crawl error:', crawlError)
          sendEvent('error', { 
            message: crawlError instanceof Error ? crawlError.message : 'Crawl failed' 
          })
        }

      } catch (error) {
        console.error('API error:', error)
        sendEvent('error', { 
          message: error instanceof Error ? error.message : 'Internal server error' 
        })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 