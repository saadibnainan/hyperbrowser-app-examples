# Deep Reddit Researcher

**Built with [Hyperbrowser](https://hyperbrowser.ai)**

A powerful Next.js application that performs deep Reddit research using AI-powered web automation. Search any topic and get real-time insights from Reddit discussions with live screenshots and intelligent Q&A capabilities.

## ✨ Features

- **Real-time Reddit Research** - Automatically searches and explores Reddit threads
- **Live Screenshots** - Watch as the app browses through Reddit pages in real-time
- **AI-Powered Q&A** - Ask questions about your research findings using GPT-4o-mini
- **Anti-Detection Browsing** - Uses Hyperbrowser's stealth technology to bypass Reddit's bot protection
- **Professional UI** - Clean, modern interface with live progress tracking
- **Data Export** - Download research results as JSON for further analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Hyperbrowser API key
- An OpenAI API key

### 1. Get Your API Keys

Get your Hyperbrowser API key at **[https://hyperbrowser.ai](https://hyperbrowser.ai)**

### 2. Clone and Install

```bash
git clone <your-repo-url>
cd deep-reddit-researcher
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Run the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## 📖 How to Use

1. **Start Research** - Enter any topic you want to research on Reddit
2. **Watch Live Progress** - See real-time screenshots as the app browses Reddit
3. **Review Results** - Screenshots appear in the left panel as pages are visited
4. **Ask Questions** - Once research is complete, ask AI questions about the findings
5. **Download Data** - Export your research results as JSON

## 🔧 How It Works

### Research Process
1. **Search Reddit** - Uses multiple Reddit URL formats for maximum success
2. **Stealth Browsing** - Employs Hyperbrowser's anti-detection technology
3. **Content Extraction** - Scrapes thread titles, content, and comments
4. **Screenshot Capture** - Takes 1280x720 screenshots of each page visited
5. **AI Analysis** - Processes content for intelligent Q&A responses

### Anti-Bot Protection
- Uses proxy rotation and stealth browsing
- Handles CAPTCHA solving automatically
- Bypasses Reddit's rate limiting and bot detection
- Falls back to mock data if all attempts are blocked

## 🏗️ Technical Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Web Automation**: Hyperbrowser SDK
- **AI**: OpenAI GPT-4o-mini
- **Data Processing**: Cheerio for HTML parsing
- **TypeScript**: Full type safety

## 📁 Project Structure

```
deep-reddit-researcher/
├── app/                    # Next.js app directory
│   ├── api/search/        # API route for research & Q&A
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── DownloadBtn.tsx    # Data export functionality
│   ├── LiveConsole.tsx    # Activity log display
│   ├── Progress.tsx       # Progress bar component
│   ├── QueryForm.tsx      # Search input form
│   └── ShotCarousel.tsx   # Screenshot carousel
├── lib/                   # Utility libraries
│   ├── hb.ts             # Hyperbrowser client setup
│   ├── json.ts           # JSON utilities
│   ├── openai.ts         # OpenAI integration
│   └── reddit.ts         # Reddit scraping logic
└── public/shots/         # Screenshot storage
```

## ⚡ Performance Notes

- Initial searches may take 60-120 seconds due to Reddit's anti-bot measures
- Subsequent requests are typically faster (30-60 seconds)
- Screenshots are optimized and cached locally
- Uses Hyperbrowser's global proxy network for reliability

## 🔒 Security & Privacy

- API keys are stored securely in environment variables
- All web requests go through Hyperbrowser's secure infrastructure
- No user data is stored or logged
- Screenshots are saved locally and can be deleted anytime

## 🐛 Troubleshooting

### Common Issues

**Slow initial loading**: This is normal due to Reddit's anti-bot protection. First searches can take 1-2 minutes.

**500 errors**: Usually indicates API key issues or network timeouts. Check your environment variables.

**No screenshots**: Ensure the `public/shots/` directory exists and is writable.

**Q&A not working**: Verify your OpenAI API key is correct and has sufficient credits.

### Debug Mode

Check the browser console and terminal logs for detailed debugging information during research.

## 📄 License

MIT License - feel free to use this project for your own research needs.

---

**Get started with Hyperbrowser today: [https://hyperbrowser.ai](https://hyperbrowser.ai)**

Follow @hyperbrowser_ai for updates.