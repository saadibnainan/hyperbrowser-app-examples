import OpenAI from 'openai'
import type { Change } from 'diff'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY env var is required')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface SummaryResult {
  summary: string
  impact: 'low' | 'medium' | 'high'
}

export async function summarize(diffBlocks: Change[]): Promise<SummaryResult> {
  // Extract meaningful changes from the diff
  const addedContent = diffBlocks
    .filter(b => b.added)
    .map(b => b.value)
    .join('')

  const removedContent = diffBlocks
    .filter(b => b.removed)
    .map(b => b.value)
    .join('')

  // Get full content to check for patterns
  const fullContent = diffBlocks.map(b => b.value).join('')

  // If no meaningful changes, return a simple summary
  if (!addedContent && !removedContent) {
    return {
      summary: "Minor content updates detected with no significant visible changes.",
      impact: 'low'
    }
  }

  // Check for specific patterns and return direct descriptions
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  const timePattern = /\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2}/
  const datePattern = /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/
  const numberPattern = /\b\d+\b/g

  // Check if this is a UUID API response (httpbin.org/uuid style)
  if (fullContent.includes('"uuid":') || fullContent.includes('uuid')) {
    // Extract UUIDs from added and removed content
    const addedUuids = addedContent.match(/[0-9a-f-]{20,}/gi) || []
    const removedUuids = removedContent.match(/[0-9a-f-]{20,}/gi) || []
    
    if (addedUuids.length > 0 || removedUuids.length > 0) {
      const oldUuid = removedUuids[0] || 'unknown'
      const newUuid = addedUuids[0] || 'unknown'
      return {
        summary: `UUID updated: ${oldUuid.slice(0, 8)}... → ${newUuid.slice(0, 8)}...`,
        impact: 'low'
      }
    }
  }

  // Check if it's a complete UUID change
  if (uuidPattern.test(addedContent) || uuidPattern.test(removedContent)) {
    const oldUuid = removedContent.match(uuidPattern)?.[0] || 'unknown'
    const newUuid = addedContent.match(uuidPattern)?.[0] || 'unknown'
    return {
      summary: `UUID value changed from ${oldUuid.slice(0, 8)}... to ${newUuid.slice(0, 8)}...`,
      impact: 'low'
    }
  }

  // Check if it's time changes
  if (timePattern.test(addedContent) || timePattern.test(removedContent)) {
    return {
      summary: "Time display updated with current timestamp.",
      impact: 'low'
    }
  }

  // Check if it's date changes
  if (datePattern.test(addedContent) || datePattern.test(removedContent)) {
    return {
      summary: "Date values updated to current date.",
      impact: 'low'
    }
  }

  // Check if it's mostly numbers changing
  const addedNumbers = addedContent.match(numberPattern) || []
  const removedNumbers = removedContent.match(numberPattern) || []
  if (addedNumbers.length > 0 || removedNumbers.length > 0) {
    return {
      summary: `Numeric content updated: ${removedNumbers.slice(0, 3).join(', ')} → ${addedNumbers.slice(0, 3).join(', ')}`,
      impact: 'low'
    }
  }

  // Check for HTML structure changes
  const hasHtmlTags = /<[^>]+>/.test(addedContent + removedContent)
  if (hasHtmlTags) {
    return {
      summary: "HTML structure modified - page layout or elements updated.",
      impact: 'medium'
    }
  }

  // For text content, show actual text changes (limited)
  const cleanAdded = addedContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 50)
  const cleanRemoved = removedContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 50)

  if (cleanAdded || cleanRemoved) {
    let summary = "Text content changed: "
    if (cleanRemoved) summary += `removed "${cleanRemoved}"`
    if (cleanAdded && cleanRemoved) summary += ", "
    if (cleanAdded) summary += `added "${cleanAdded}"`
    
    return {
      summary: summary,
      impact: 'low'
    }
  }

  // Fallback
  return {
    summary: "Content changes detected on the website.",
    impact: 'low'
  }
} 