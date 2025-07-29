# Site-to-Dataset

**Built with [Hyperbrowser](https://hyperbrowser.ai)**

Transform any documentation website into high-quality Q/A datasets ready for LLM fine-tuning. Just paste a URL and get professional training data in minutes.


## ✨ Features

- **🌐 Smart Web Scraping**: Extract meaningful content from any documentation site using Hyperbrowser's official API
- **🤖 AI-Powered Generation**: Create natural Q/A pairs optimized for language model training with GPT-4o-mini
- **📊 Real-time Processing**: Live console output and progress tracking during dataset generation
- **📁 Export Ready**: Download in both JSONL (recommended) and JSON formats
- **🎨 Clean Interface**: Minimal, black-and-white design focused on functionality
- **⚡ Optimized Performance**: Batch processing and smart chunking for faster results

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **Get an API key**: Visit [hyperbrowser.ai](https://hyperbrowser.ai) to sign up and obtain your API key
- OpenAI API key for Q/A generation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hyperbrowserai/hyperbrowser-app-examples
cd site-to-dataset
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 How It Works

1. **Input URL**: Enter any documentation or blog URL
2. **Smart Extraction**: Hyperbrowser scrapes and processes the content
3. **AI Processing**: GPT-4o-mini generates high-quality Q/A pairs from content chunks
4. **Live Monitoring**: Watch real-time progress in the console
5. **Export**: Download your dataset in JSONL or JSON format

### Example Output

```jsonl
{"question":"What is the primary purpose of the API?","answer":"The API allows developers to integrate advanced web scraping capabilities into their applications with minimal setup.","source_url":"https://docs.example.com/api"}
{"question":"How do you authenticate API requests?","answer":"Authentication is handled through API keys passed in the request headers using the 'Authorization: Bearer <token>' format.","source_url":"https://docs.example.com/auth"}
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Animation**: Framer Motion for smooth interactions
- **Web Scraping**: [@hyperbrowser/sdk](https://hyperbrowser.ai) - Official Hyperbrowser SDK
- **AI Processing**: OpenAI GPT-4o-mini for Q/A generation
- **Content Processing**: Cheerio for HTML parsing

## 📋 API Endpoints

### `POST /api/generate`

Generate Q/A dataset from a URL.

**Request Body:**
```json
{
  "url": "https://docs.example.com"
}
```

**Response:** Server-sent events stream with progress updates and final results.

## 🎯 Use Cases

- **LLM Fine-tuning**: Create custom training datasets for domain-specific models
- **Chatbot Training**: Generate conversational data from documentation
- **Knowledge Base Creation**: Convert existing docs into structured Q/A format
- **Educational Content**: Transform articles into learning materials
- **Research**: Analyze documentation patterns and content structure

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `HYPERBROWSER_API_KEY` | Your Hyperbrowser API key | ✅ |
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |

### Customization

The application supports various customization options:

- **Chunk Size**: Modify content chunking parameters in `lib/scrape.ts`
- **AI Prompts**: Customize Q/A generation prompts in `lib/qa.ts`
- **Batch Size**: Adjust parallel processing in the API configuration
- **UI Styling**: Modify the black-and-white theme in `app/globals.css`

## 🛠️ Development

### Project Structure

```
site-to-dataset/
├── app/                    # Next.js app directory
│   ├── api/generate/      # API route for processing
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation header
│   ├── UrlForm.tsx        # URL input form
│   ├── LiveConsole.tsx    # Real-time log display
│   ├── Table.tsx          # Results table
│   └── DownloadBtn.tsx    # Export functionality
├── lib/                   # Core utilities
│   ├── hb.ts             # Hyperbrowser client
│   ├── scrape.ts         # Web scraping logic
│   ├── qa.ts             # Q/A generation
│   └── jsonl.ts          # Export utilities
└── public/               # Static assets
```

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🤝 Contributing

We welcome contributions! Please see the [Hyperbrowser App Examples](https://github.com/hyperbrowserai/hyperbrowser-app-examples) repository for contribution guidelines.

### Development Guidelines

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Maintain the black-and-white design aesthetic
4. Test with various documentation sites
5. Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

**"No content chunks found"**
- Ensure the URL is accessible and contains meaningful content
- Some sites may have anti-scraping measures

**"API rate limits"**
- Reduce batch size in processing configuration
- Add delays between requests if needed

**"Build errors"**
- Ensure all environment variables are set
- Check that API keys are valid

### Getting Help

- 📚 [Hyperbrowser Documentation](https://docs.hyperbrowser.ai)
- 💬 [Community Support](https://github.com/hyperbrowserai/)
- 🐛 [Report Issues](https://github.com/hyperbrowserai/hyperbrowser-app-examples/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Hyperbrowser](https://hyperbrowser.ai)** - For powerful web scraping capabilities
- **OpenAI** - For advanced language model processing
- **Next.js Team** - For the excellent React framework
- **Vercel** - For seamless deployment platform

---

**Ready to build something amazing?** Get your API keys at [hyperbrowser.ai](https://hyperbrowser.ai) and start transforming websites into training data! 🎉

Follow [@hyperbrowser_ai](https://x.com/hyperbrowser) for updates.
