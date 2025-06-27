# DeepCrawler 🕷️

> Uncover every hidden API endpoint on any website in 60 seconds.

DeepCrawler is a powerful web application that uses AI-powered browser automation to discover API endpoints on any website. Built with Next.js 14 and powered by the Hyperbrowser SDK.

## ✨ Features

- **🚀 Fast Discovery**: Find API endpoints in under 60 seconds
- **📊 Real-time Progress**: Live terminal showing crawl progress
- **📁 Export Options**: Download as Postman collection or copy as JSON
- **🎨 Modern UI**: Glassmorphism design with smooth animations
- **🔒 Rate Limited**: Built-in protection against abuse
- **📱 Responsive**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Automation**: Hyperbrowser SDK
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- A [Hyperbrowser API key](https://hyperbrowser.ai)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deep-crawler-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Hyperbrowser API key to `.env.local`:
   ```env
   HYPERBROWSER_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Enter a URL**: Paste any website URL (e.g., `news.ycombinator.com`)
2. **Start Crawling**: Click "Start Crawl" to begin discovery
3. **Watch Progress**: Monitor real-time logs in the terminal sidebar
4. **Export Results**: Download as Postman collection or copy JSON

### Example Results

Crawling `https://hyperbrowser.ai` typically discovers:
- `/api/stories` - Story listings
- `/api/user/{id}` - User profiles  
- `/api/item/{id}` - Individual items
- And many more...

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HYPERBROWSER_API_KEY` | Your Hyperbrowser API key | ✅ |

### Customization

The app can be customized by modifying:
- **Colors**: Update `tailwind.config.js` 
- **Timeout**: Adjust crawl timeout in `app/api/crawl/route.ts`
- **Rate Limits**: Modify rate limiting in the API route
- **UI Components**: Edit components in `/components`

## 🏗️ Project Structure

```
deep-crawler-bot/
├── app/
│   ├── api/crawl/route.ts      # Main crawling endpoint
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/
│   ├── UrlForm.tsx             # URL input form
│   ├── ProgressBar.tsx         # Progress indicator
│   ├── ResultCard.tsx          # Results display
│   └── TerminalSidebar.tsx     # Live log sidebar
├── lib/
│   ├── hyper.ts                # Hyperbrowser wrapper
│   └── utils.ts                # Helper functions
└── public/                     # Static assets
```

## 🔬 How It Works

1. **Input Validation**: URL is validated and normalized
2. **Rate Limiting**: IP-based rate limiting (1 request/hour)
3. **Browser Launch**: Stealth browser with residential proxy
4. **Network Monitoring**: Intercepts all network requests
5. **API Detection**: Filters for API-like endpoints
6. **Real-time Streaming**: Server-Sent Events for live updates
7. **Data Processing**: Deduplication and Postman generation
8. **Export**: Multiple export formats available

## 📊 Performance

- **TTFB**: < 200ms on Vercel
- **Build Time**: ~30 seconds
- **Bundle Size**: Optimized for production
- **Crawl Speed**: Most sites complete in 30-60 seconds

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in project settings
3. **Deploy** - that's it!

### Other Platforms

The app works on any Node.js hosting platform:
- Railway
- Render  
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Hyperbrowser Docs](https://docs.hyperbrowser.ai)
- **API Issues**: Contact Hyperbrowser support
- **App Issues**: Open a GitHub issue

## 🙏 Acknowledgments

- [Hyperbrowser](https://hyperbrowser.ai) for the powerful browser automation SDK

---

<div align="center">
  <p>Built with ❤️ using Hyperbrowser SDK</p>
  <p>
    <a href="https://hyperbrowser.ai">Get your API key</a> •
    <a href="https://docs.hyperbrowser.ai">Documentation</a>
  </p>
</div>
