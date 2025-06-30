import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { crawl } from '../../../lib/crawl'
import { diffHtml } from '../../../lib/diff-html'
import { readDb, writeDb } from '../../../lib/db'
import { summarize } from '../../../lib/summarize'
import { notify } from '../../../lib/notify'

export async function POST(req: NextRequest) {
  const { tracked_url_id } = await req.json()
  
  const db = await readDb()
  const trackedUrl = db.tracked_urls.find((t) => t.id === tracked_url_id)
  if (!trackedUrl) return new Response('not found', { status: 404 })

  let crawlResult
  try {
    crawlResult = await crawl(trackedUrl.url)
  } catch (error) {
    console.error('Crawl failed:', error)
    return new Response(`Crawl failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }

  const { html } = crawlResult

  // Validate that we have valid data
  if (!html) {
    console.error('Invalid crawl result - missing HTML')
    return new Response('Invalid crawl result', { status: 500 })
  }

  console.log(`Crawled ${trackedUrl.url} - HTML: ${html.length} chars`)

  // Get the last snapshot for comparison
  const lastSnapshot = db.snapshots
    .filter((s) => s.tracked_url_id === tracked_url_id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  // Create new snapshot
  const snapshotId = uuidv4()
  const timestamp = Date.now()
  
  db.snapshots.push({
    id: snapshotId,
    tracked_url_id,
    html,
    created_at: new Date().toISOString(),
  })

  // If there's a previous snapshot, compare them
  if (lastSnapshot) {
    const htmlDiff = diffHtml(lastSnapshot.html, html)
    
    // Only create a change record if there are actual differences
    if (htmlDiff.length > 0) {
      console.log(`Changes detected for ${trackedUrl.url}`)
      
      // Generate AI summary
      const summary = await summarize(htmlDiff)
      
      // Create change record
      const changeId = uuidv4()
      db.changes.push({
        id: changeId,
        tracked_url_id,
        snapshot_id: snapshotId,
        diff_html: JSON.stringify(htmlDiff),
        pixel_change: 0, // No pixel comparison
        summary: summary.summary,
        impact: summary.impact,
        created_at: new Date().toISOString(),
      })

      // Send notification
      await notify(trackedUrl, summary, htmlDiff.length > 0 ? 1 : 0)
      
      console.log(`Change recorded for ${trackedUrl.url}`)
    } else {
      console.log(`No changes detected for ${trackedUrl.url}`)
    }
  } else {
    console.log(`First snapshot created for ${trackedUrl.url}`)
  }

  await writeDb(db)
  return new Response('ok')
} 