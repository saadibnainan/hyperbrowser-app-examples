import { NextRequest, NextResponse } from 'next/server'
import { scrapeSearchResults } from '../../../lib/scrape'
import { generateAnswer } from '../../../lib/answer'
import { buildPostmanCollection, buildEndpointManifest } from '../../../lib/postman'
import { createZipBundle } from '../../../lib/zip'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      )
    }

    // Check for Hyperbrowser API key in environment
    if (!process.env.HYPERBROWSER_API_KEY) {
      return NextResponse.json(
        { error: 'Hyperbrowser API key not configured on server' },
        { status: 500 }
      )
    }

    // Set up Server-Sent Events
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const sendData = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        const sendLog = (message: string) => {
          sendData({ type: 'log', message })
        }

        const sendProgress = (progress: number) => {
          sendData({ type: 'progress', progress })
        }

        try {
          sendLog('🚀 Starting OpenAI SourceForge research...')
          sendProgress(5)

          // Step 1: Scrape search results using Hyperbrowser
          sendLog('🔍 Scraping search results with Hyperbrowser...')
          const scrapeResult = await scrapeSearchResults(
            query,
            process.env.HYPERBROWSER_API_KEY!,
            sendProgress,
            sendLog
          )

          sendLog(`✅ Scraped ${scrapeResult.sources.length} sources with ${scrapeResult.totalEndpoints} endpoints`)
          sendProgress(70)

          // Step 2: Generate answer using OpenAI
          sendLog('🤖 Generating AI answer with GPT-4o...')
          const answerResult = await generateAnswer(query, scrapeResult.sources)
          sendProgress(85)

          // Step 3: Build Postman collection and manifest
          sendLog('📦 Building Postman collection...')
          const postmanCollection = buildPostmanCollection(scrapeResult.sources, query)
          const endpointManifest = buildEndpointManifest(scrapeResult.sources, query)
          sendProgress(90)

          // Step 4: Create downloadable ZIP
          sendLog('🗜️ Creating download package...')
          const zipBuffer = await createZipBundle({
            answerMarkdown: answerResult.answerMarkdown,
            postmanCollection,
            endpointManifest,
            query
          })
          sendProgress(95)

          // Convert zip buffer to base64 for transmission
          const zipBase64 = zipBuffer.toString('base64')

          sendLog('✨ Research complete!')
          sendProgress(100)

          // Send final result
          sendData({
            type: 'complete',
            result: {
              answerMarkdown: answerResult.answerMarkdown,
              citations: answerResult.citations,
              postmanCollection,
              endpointManifest,
              zipFile: zipBase64,
              creditsUsed: scrapeResult.creditsUsed,
              stats: {
                sources: scrapeResult.sources.length,
                endpoints: scrapeResult.totalEndpoints,
                citations: answerResult.citations.length
              }
            }
          })

        } catch (error) {
          console.error('Research error:', error)
          sendLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
          sendData({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          })
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 