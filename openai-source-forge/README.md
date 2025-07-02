# OpenAI SourceForge

Drop in any question → this app scrapes fresh results from Google/Bing + Reddit  
using stealth browsers via **[Hyperbrowser](https://hyperbrowser.ai)**, extracts every  
hidden API request, and pipes it into **GPT-4o** to generate a real-time  
answer with source citations and developer-ready API samples.

## 🔑 Get started

1. **Get your API Keys**:
   - [Hyperbrowser API Key](https://hyperbrowser.ai) 
   - [OpenAI API Key](https://platform.openai.com/api-keys)

2. Clone this repo and set up environment:

```bash
git clone <your-repo-url>
cd openai-source-forge
cp .env.example .env
```

3. Add your API keys to `.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
```

4. Install and run:
```bash
npm install
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## ✨ Features

- **Real-time Web Research**: Uses Hyperbrowser to scrape live search results
- **AI-Powered Answers**: GPT-4o generates comprehensive answers with citations
- **API Discovery**: Automatically captures hidden API endpoints during scraping
- **Developer Tools**: Download Postman collections and endpoint manifests
- **Live Console**: Watch the research process in real-time
- **Citation Tooltips**: Hover over citations to see source details
- **Environment-based**: Secure API key management through environment variables

## 🔧 How it Works

1. **Search**: Takes your question and runs multiple search queries (Google, Reddit, documentation sites)
2. **Scrape**: Uses Hyperbrowser SDK to navigate and extract content from search results
3. **Analyze**: Captures all API endpoints made during page loads
4. **Generate**: Sends scraped content to GPT-4o for intelligent analysis
5. **Package**: Creates downloadable bundles with answers, citations, and API data

## 📦 Downloads

After each research session, you get:

- **📄 AI Answer**: Markdown formatted answer with inline citations
- **🔗 Postman Collection**: v2.1 collection with all discovered API endpoints  
- **📊 Endpoint Manifest**: Structured JSON data about captured APIs
- **📁 Complete ZIP**: Everything bundled together

## 🎨 Tech Stack

- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** with glassmorphism styling
- **Hyperbrowser SDK v0.51.0** for stealth web scraping
- **OpenAI GPT-4o** for intelligent answer generation
- **Lucide React** for beautiful icons
- **Archiver** for ZIP file creation

## 🚀 Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fopenai-source-forge)

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
NEXT_PUBLIC_SITE_DOMAIN=your-domain.com
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📖 API Reference

### POST /api/ask

Performs research and generates answer with citations.

**Request Body:**
```json
{
  "query": "Your research question"
}
```

**Response:** Server-Sent Events stream with:
- `progress`: Research progress updates
- `log`: Real-time log messages  
- `complete`: Final results with answer and downloads
- `error`: Error messages

## 🎯 Examples

**Question:** "How to implement OAuth2 in Node.js?"

**Output:**
- Comprehensive markdown answer with step-by-step implementation
- Citations linking to official docs, Stack Overflow, GitHub repos
- Postman collection with OAuth2 API endpoints discovered during research
- Complete package as downloadable ZIP

## 🔐 Privacy & Security

- API keys stored securely in environment variables
- No data is stored permanently
- All processing happens in real-time
- Hyperbrowser sessions are automatically cleaned up after use

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Credits

- **[Hyperbrowser](https://hyperbrowser.ai)** - Stealth web scraping infrastructure
- **[OpenAI](https://openai.com)** - GPT-4o language model
- **[Next.js](https://nextjs.org)** - React framework
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

---

Built with ❤️ using Hyperbrowser + OpenAI + Next.js
