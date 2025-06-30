# Competitor Tracker 🚀

> Monitor competitor websites for changes and get AI-powered summaries with accurate change detection.

## Features

✨ **Smart Change Detection**
- Track competitor websites for real changes
- Accurate pattern-based summaries (no AI hallucinations)
- Detect UUID changes, time updates, content modifications
- Visual diff highlighting

🎯 **Flexible Monitoring**
- Schedule hourly, 3-hourly, or daily crawls
- CSS selector targeting for specific page elements
- Manual crawl triggers for instant checks

🔧 **Developer Friendly**
- Built with Next.js 14, TypeScript, and Tailwind CSS
- Clean JSON-based data storage
- Dark theme UI with neon accents

## Quick Start

### 1. Get API Keys

- **Hyperbrowser API Key**: Get yours at [hyperbrowser.ai](https://hyperbrowser.ai)
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. Install & Setup

```bash
# Clone and install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Configure Environment

Add your API keys to `.env.local`:

```env
HYPERBROWSER_API_KEY=your_hyperbrowser_key_here
OPENAI_API_KEY=your_openai_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🕶️

## Testing URLs

Perfect for testing your competitor tracker:

- `https://httpbin.org/uuid` - Returns different UUID each time
- `https://worldtimeapi.org/api/timezone/America/New_York` - Current time updates
- `https://httpbin.org/cache` - Timestamp and cache headers
- `https://api.github.com/zen` - Random motivational quotes
- `https://httpbin.org/headers` - Request headers with timestamps

## Environment Variables

| Key | Description | Required |
| --- | --- | --- |
| `HYPERBROWSER_API_KEY` | Get from [hyperbrowser.ai](https://hyperbrowser.ai) | ✅ |
| `OPENAI_API_KEY` | Get from [OpenAI Platform](https://platform.openai.com/api-keys) | ✅ |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook (optional) | ❌ |
| `DISCORD_WEBHOOK_URL` | Discord webhook (optional) | ❌ |

## How It Works

1. **Add URLs**: Track competitor websites with configurable frequency
2. **Smart Crawling**: Uses Hyperbrowser SDK for reliable web scraping
3. **Change Detection**: Compares HTML content using diff algorithms
4. **Pattern Recognition**: Identifies specific changes (UUIDs, times, numbers, text)
5. **Accurate Summaries**: No AI hallucinations - shows exactly what changed

## License

MIT
