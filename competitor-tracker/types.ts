export type Frequency = 'hourly' | '3hourly' | 'daily'

export interface TrackedURL {
  id: string
  url: string
  frequency: Frequency
  selectors?: string
  created_at: string
}

export interface Snapshot {
  id: string
  tracked_url_id: string
  html: string
  created_at: string
}

export interface Change {
  id: string
  tracked_url_id: string
  snapshot_id: string
  diff_html: string
  pixel_change: number // Keep for backward compatibility, always 0
  summary: string
  impact: 'low' | 'medium' | 'high'
  created_at: string
}

export interface Database {
  tracked_urls: TrackedURL[]
  snapshots: Snapshot[]
  changes: Change[]
} 