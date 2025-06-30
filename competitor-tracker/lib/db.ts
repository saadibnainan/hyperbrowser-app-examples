import { promises as fs } from 'fs'
import path from 'path'
import { TrackedURL, Snapshot, Change } from '../types'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')

interface DB {
  tracked_urls: TrackedURL[]
  snapshots: Snapshot[]
  changes: Change[]
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DB_PATH)
  } catch {
    const initial: DB = { tracked_urls: [], snapshots: [], changes: [] }
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2))
  }
}

export async function readDb(): Promise<DB> {
  await ensureFile()
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function writeDb(db: DB) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
} 