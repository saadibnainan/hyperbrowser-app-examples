import { NextRequest } from 'next/server'
import { readDb, writeDb } from '../../../../lib/db'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await readDb()
  db.tracked_urls = db.tracked_urls.filter((t) => t.id !== id)
  db.snapshots = db.snapshots.filter((s) => s.tracked_url_id !== id)
  db.changes = db.changes.filter((c) => c.tracked_url_id !== id)
  await writeDb(db)
  return new Response(null, { status: 204 })
} 