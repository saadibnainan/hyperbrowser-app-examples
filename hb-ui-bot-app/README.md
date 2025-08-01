# UI Bot

**Built with [Hyperbrowser](https://hyperbrowser.ai)**

A minimal Next.js app that screenshots websites and analyzes UI/UX issues that might cause users to leave. Uses Hyperbrowser for automated browser analysis and OpenAI for detailed UX insights.

## Features

- 🤖 Real browser testing using Hyperbrowser's AI agents
- 🔍 AI-powered UI/UX analysis identifying why users leave websites
- ⚡ Automated URL formatting (just type "example.com")
- 📊 Categorized insights: Critical Issues, UX Problems, Performance Concerns, Conversion Barriers
- 💡 Actionable recommendations for improving user experience
- 🎯 Professional YC startup-style interface with minimal design

## Getting Started

### 1. Get API Keys

- **Hyperbrowser**: Get an API key from https://hyperbrowser.ai
- **OpenAI**: Get an API key from https://platform.openai.com/api-keys

### 2. Environment Setup

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## How It Works

1. **Input URL**: Enter any website URL you want to analyze
2. **Screenshot & Analysis**: Hyperbrowser takes a full-page screenshot and performs initial UI analysis
3. **AI Processing**: OpenAI analyzes the results to identify specific issues and provide actionable recommendations
4. **Results**: Get categorized insights on critical issues, UX problems, performance concerns, and conversion barriers

## Example Use Cases

- **Landing Page Optimization**: Identify why visitors aren't converting
- **E-commerce Analysis**: Find checkout flow issues and product page problems  
- **SaaS Dashboard Review**: Improve user onboarding and feature discovery
- **Mobile Experience Audit**: Ensure responsive design works properly

## Tech Stack

- **Next.js 15** - React framework
- **Hyperbrowser SDK** - Browser automation and screenshot capture
- **OpenAI GPT-4** - AI-powered analysis and recommendations  
- **TypeScript** - Type safety
- **Tailwind CSS** - Minimal, utility-first styling

## API Reference

The app uses Hyperbrowser's Browser Use agent with vision capabilities enabled:

- `useVision: true` - Enables screenshot analysis
- `useVisionForPlanner: true` - Provides visual context for planning
- Session configured at 1920x1080 for full desktop analysis

Follow [@hyperbrowser_ai](https://x.com/hyperbrowser) for updates.
