import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { readDb, writeDb } from '../../../lib/db'

export async function POST(req: NextRequest) {
  const { url, frequency, selectors } = await req.json()

  if (!url || !frequency) {
    return new Response('url and frequency required', { status: 400 })
  }

  const db = await readDb()

  const newTracked = {
    id: uuidv4(),
    url,
    frequency,
    selectors: selectors ?? [],
    created_at: new Date().toISOString(),
  }

  db.tracked_urls.push(newTracked)
  await writeDb(db)

  return Response.json(newTracked)
} 