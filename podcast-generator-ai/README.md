# AI Podcast Generator

Transform any website content into engaging podcasts using AI. This application uses Hyperbrowser for intelligent web scraping, OpenAI for script generation, and ElevenLabs for realistic voice synthesis.

**Get your Hyperbrowser API keys at [hyperbrowser.ai](https://hyperbrowser.ai)**

## Features

- **Intelligent Content Extraction**: Uses Hyperbrowser to extract relevant content from news articles, blog posts, and changelogs
- **AI Script Generation**: Converts extracted content into engaging podcast scripts with OpenAI
- **Realistic Voice Synthesis**: Generates high-quality audio using ElevenLabs TTS
- **Professional Interface**: Clean, modern UI with audio playback and download capabilities
- **Simple Setup**: Only requires one API key from the user interface

## Demo

1. Enter your Hyperbrowser API key in the sidebar (get yours at [hyperbrowser.ai](https://hyperbrowser.ai))
2. Enter any URL containing news, articles, or changelog content
3. Watch as the AI extracts, processes, and converts content into a podcast
4. Listen to the generated podcast with the built-in player
5. Download the audio file for offline listening

## Setup

### Prerequisites

- Node.js 18+ 
- API keys for:
  - **[Hyperbrowser](https://hyperbrowser.ai/)** - For web content extraction (entered via UI)
  - [OpenAI](https://platform.openai.com/) - For script generation (environment variable)
  - [ElevenLabs](https://elevenlabs.io/) - For voice synthesis (environment variable)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd podcast-generator-ai
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your server API keys:
```env
# OpenAI API Key  
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. **Get your Hyperbrowser API key at [hyperbrowser.ai](https://hyperbrowser.ai)** and enter it in the sidebar

## How It Works

### 1. Content Extraction
- Uses Hyperbrowser's powerful scraping capabilities to extract structured content
- Intelligently identifies titles, main content, summaries, and metadata
- Handles various website formats including news sites and documentation

### 2. Script Generation  
- Leverages OpenAI's GPT-4 to transform extracted content into engaging podcast scripts
- Creates natural, conversational content that starts with "Hey everyone welcome to the podcast..."
- Optimizes for 3-5 minute episodes with proper pacing and engagement

### 3. Audio Generation
- Uses ElevenLabs' advanced TTS to create realistic podcast audio
- Supports multiple voice options and customizable voice settings
- Generates high-quality MP3 files suitable for podcast distribution

## API Endpoints

- `POST /api/extract-content` - Extract content from a URL using Hyperbrowser
- `POST /api/generate-script` - Generate podcast script from extracted content
- `POST /api/generate-audio` - Convert script to audio using ElevenLabs

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Hubot Sans
- **Backend**: Next.js API Routes
- **Web Scraping**: Hyperbrowser SDK
- **AI/ML**: OpenAI GPT-4
- **Voice Synthesis**: ElevenLabs TTS
- **UI Components**: Lucide React icons

## Usage Examples

Perfect for converting:
- News articles and breaking news
- Product announcements and changelogs  
- Blog posts and technical articles
- Research papers and reports
- Company updates and press releases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
