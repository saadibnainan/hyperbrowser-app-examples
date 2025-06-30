import { TrackedURL } from '../types'

export async function notify(
  trackedUrl: TrackedURL, 
  summary: { summary: string; impact: 'low' | 'medium' | 'high' }, 
  hasChanges: number
) {
  const webhookUrls = [
    process.env.SLACK_WEBHOOK_URL, 
    process.env.DISCORD_WEBHOOK_URL
  ].filter(Boolean) as string[]

  if (webhookUrls.length === 0) {
    console.log('No webhook URLs configured, skipping notification')
    return
  }

  const payload = {
    username: 'Competitor Tracker',
    embeds: [
      {
        title: `Change detected on ${trackedUrl.url}`,
        description: summary.summary,
        color: summary.impact === 'high' ? 0xff4444 : summary.impact === 'medium' ? 0xffaa44 : 0x44ff44,
        fields: [
          { name: 'Impact', value: summary.impact.toUpperCase(), inline: true },
          { name: 'Type', value: 'Content Changes', inline: true },
          { name: 'URL', value: trackedUrl.url, inline: false },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    await Promise.all(
      webhookUrls.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      ),
    )
    console.log(`Notification sent for ${trackedUrl.url}`)
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
} 