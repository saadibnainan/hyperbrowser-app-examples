# Assets Optimizer

A powerful Next.js 14 app that optimizes web assets (images, CSS, JavaScript, fonts) from any website using the Hyperbrowser SDK. Built with modern UI components inspired by deep-crawler.

## ✨ Features

- **Real Asset Extraction**: Uses Hyperbrowser to scrape and extract assets from any website
- **Smart Optimization**: 
  - Images → AVIF format with 50% quality for maximum compression
  - Fonts → Subset to only used characters and convert to WOFF2
  - Video → Extract poster frames in JPEG format
- **Live Progress Tracking**: Real-time terminal sidebar showing extraction progress
- **Modern UI**: Clean, responsive interface with glassmorphism design
- **Download Options**: Get optimized assets as ZIP file plus detailed JSON report

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- A [Hyperbrowser API key](https://hyperbrowser.ai) (required for web scraping)

### Installation

1. **Get your API key**
   - Visit [Hyperbrowser.ai](https://hyperbrowser.ai)
   - Sign up for an account
   - Get your API key from the dashboard

2. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Add your API key to .env.local
   HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Enter a URL**: Paste any website URL (e.g., `https://hyperbrowser.ai`)
2. **Start Optimization**: Click "Start Optimization" to begin asset extraction
3. **Monitor Progress**: Watch real-time logs in the terminal sidebar
4. **Download Results**: Get optimized assets as ZIP file and detailed JSON report

## 🛠️ How It Works

1. **Web Scraping**: Uses Hyperbrowser SDK to extract HTML content from the target website
2. **Asset Discovery**: Parses HTML to find images, CSS files, JavaScript, and fonts
3. **Smart Download**: Downloads all discovered assets with proper error handling
4. **Optimization Pipeline**:
   - **Images**: Convert to AVIF format for 50%+ size reduction
   - **Fonts**: Subset to only used characters and convert to WOFF2
   - **Videos**: Extract poster frames as optimized JPEG
   - **Other files**: Keep as-is for compatibility
5. **Bundle Creation**: Package optimized assets with updated HTML into downloadable ZIP

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Web Scraping**: Hyperbrowser SDK
- **Asset Processing**: Sharp (images), subset-font (fonts), FFmpeg (videos)
- **UI Components**: Custom components with glassmorphism design
- **Icons**: Lucide React

## 📊 Optimization Results

Typical results from optimizing a modern website:
- **Images**: 50-80% size reduction (JPEG/PNG → AVIF)
- **Fonts**: 70-90% size reduction (subset + WOFF2)
- **Overall**: 40-60% total asset size reduction

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
# Required: Your Hyperbrowser API key
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
```

## 📝 API Endpoints

- `POST /api/optimize` - Main optimization endpoint that streams progress via Server-Sent Events

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙋‍♂️ Support

- [Hyperbrowser Documentation](https://hyperbrowser.ai/docs)
- [GitHub Issues](https://github.com/yourusername/assets-optimizer/issues)

---

Built with ❤️ using [Hyperbrowser](https://hyperbrowser.ai)
