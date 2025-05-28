# 🚀 Reddit Idea Generator

A powerful AI-driven tool that analyzes Reddit discussions to discover real pain points and generate actionable business ideas. Built with Next.js and powered by Hyperbrowser AI.

![Reddit Idea Generator](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🔍 **Real Data Analysis** - Analyze authentic Reddit discussions to find genuine user problems
- ⚡ **AI-Powered Insights** - Leverage advanced AI to extract insights and generate actionable business ideas
- 🚀 **Implementation Ready** - Get concrete solutions with clear pain points and implementation strategies
- 🎨 **Modern UI** - Beautiful, responsive interface with smooth animations
- 🔐 **Secure** - API keys are stored locally and never saved on servers

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Hyperbrowser SDK
- **Validation**: Zod
- **Architecture**: Component-based with custom hooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Hyperbrowser API key (get yours at [hyperbrowser.ai](https://hyperbrowser.ai))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reddit-idea-generator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Get Your Hyperbrowser API Key

1. Visit [hyperbrowser.ai](https://hyperbrowser.ai)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. You'll enter this key in the app's sidebar when you first use it

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🎯 How to Use

1. **Setup API Key**: Click the "Setup API Key" button in the top-right corner
2. **Enter Your Key**: Paste your Hyperbrowser API key from [hyperbrowser.ai](https://hyperbrowser.ai)
3. **Choose a Niche**: Enter any topic you're interested in (e.g., "productivity", "fitness", "cooking")
4. **Generate Ideas**: Click "Generate Ideas" and watch as the AI analyzes Reddit discussions
5. **Review Results**: Get actionable business ideas with implementation guides

## 📁 Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Input, etc.)
│   ├── navigation/      # Navigation components (Navbar, Sidebar)
│   ├── sections/        # Page sections (Hero, Ideas Grid, etc.)
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   └── useIdeaGeneration.ts
├── lib/                 # Utility functions
│   ├── schemas.ts       # Zod validation schemas
│   ├── hyperbrowser.ts  # Hyperbrowser API utilities
│   └── errorHandling.ts # Error handling utilities
├── types/               # TypeScript type definitions
├── api/                 # API routes
│   └── generate/        # Idea generation endpoint
└── page.tsx             # Main application page
```

## 🔧 Configuration

### Environment Variables

No environment variables are required! The app uses client-side API key input for security and flexibility.

### API Key Setup

Your Hyperbrowser API key is:
- ✅ Stored locally in your browser
- ✅ Never sent to our servers
- ✅ Only used to authenticate with Hyperbrowser
- ✅ Can be changed anytime in the sidebar

## 🌟 Key Components

- **`useIdeaGeneration`** - Custom hook managing all state and API logic
- **`HeroSection`** - Main interface with search functionality
- **`IdeasGrid`** - Displays generated ideas in an organized grid
- **`Sidebar`** - API key configuration panel
- **`ProgressBar`** - Real-time progress indicator

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with one click!

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Issues**: Open an issue on GitHub
- 🌐 **Hyperbrowser**: Visit [hyperbrowser.ai](https://hyperbrowser.ai) for API support
- 📖 **Documentation**: Check the [Hyperbrowser docs](https://docs.hyperbrowser.ai)

## 🙏 Acknowledgments

- [Hyperbrowser](https://hyperbrowser.ai) for providing the AI extraction capabilities
- [Next.js](https://nextjs.org) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- Reddit community for being an endless source of real user insights

---

**Ready to discover your next big idea?** Get your free API key at [hyperbrowser.ai](https://hyperbrowser.ai) and start generating! 🚀
