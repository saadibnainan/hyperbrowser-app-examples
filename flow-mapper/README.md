# FlowMapper - Interactive User Flow Generator

**Transform any website into interactive flow diagrams and automated tests using the Hyperbrowser SDK.**

FlowMapper is a powerful web application that crawls websites and generates:
- 📊 Interactive flow diagrams (Mermaid.js)
- 🎭 Playwright test automation code
- ⚛️ React XState components
- 📮 Postman API collections
- 📸 Visual screenshots of each step

## 🚀 Features

### Core Capabilities
- **Smart Website Crawling**: Uses Hyperbrowser SDK with stealth mode and proxy support
- **Visual Flow Generation**: Creates beautiful Mermaid diagrams
- **Multi-Format Export**: Playwright, React/XState, Postman collections
- **API Discovery**: Automatically detects and maps API endpoints
- **Screenshot Capture**: Visual documentation of each user flow step
- **Enterprise Features**: Proxy rotation, CAPTCHA solving, anti-detection

### Hyperbrowser Integration
- **Stealth Mode**: Bypass bot detection systems
- **Proxy Support**: Residential proxy rotation
- **Enterprise Security**: Advanced anti-detection capabilities
- **AI-Powered Extraction**: Intelligent content and link extraction
- **Session Management**: Persistent browser sessions
- **Network Traffic Recording**: Complete API endpoint discovery

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Visualization**: Mermaid.js, ReactFlow
- **Web Automation**: Hyperbrowser SDK v0.51.0
- **Code Generation**: EJS templating
- **File Processing**: JSZip for downloadable packages

## 📋 Prerequisites

1. **Hyperbrowser API Key**: Get your API key from [Hyperbrowser](https://hyperbrowser.ai)
2. **Node.js**: Version 18 or higher
3. **npm**: Latest version

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd flow-mapper
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Application
Navigate to `http://localhost:3000`

### 4. Configure Hyperbrowser
1. Enter your Hyperbrowser API key
2. Paste the target website URL
3. Set crawl depth (1-5 recommended)
4. Click "Start Crawling"

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
HYPERBROWSER_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_DOMAIN=http://localhost:3000
```

### Hyperbrowser Features
The application uses these Hyperbrowser enterprise features:
- **Stealth Mode**: `useStealth: true`
- **Proxy Rotation**: `useProxy: true`
- **Ad Blocking**: `adblock: true`
- **Tracker Blocking**: `trackers: true`
- **Cookie Management**: `acceptCookies: true`
- **Screenshot Capture**: `screenshotOptions.fullPage: true`

## 📊 Generated Outputs

### 1. Interactive Flow Diagram
- Mermaid.js syntax for visual flows
- Clickable nodes with screenshots
- Relationship mapping between pages

### 2. Playwright Test Code
```javascript
// Generated Playwright test
import { test, expect } from '@playwright/test';

test('User Flow Test', async ({ page }) => {
  await page.goto('https://example.com');
  // ... automated test steps
});
```

### 3. React XState Component
```jsx
// Generated React component with state machine
import { useMachine } from '@xstate/react';

export const UserFlowComponent = () => {
  const [state, send] = useMachine(userFlowMachine);
  // ... component logic
};
```

### 4. Postman Collection
- Complete API endpoint documentation
- Request/response examples
- Environment variables
- Test scripts

## 🎯 Use Cases

### For Developers
- **Test Automation**: Generate Playwright tests from user flows
- **API Documentation**: Auto-discover and document APIs
- **Flow Analysis**: Understand complex user journeys

### For QA Teams
- **Test Case Generation**: Automated test scenario creation
- **Regression Testing**: Comprehensive flow validation
- **Visual Testing**: Screenshot-based verification

### For Product Teams
- **User Journey Mapping**: Visual flow documentation
- **Conversion Analysis**: Identify drop-off points
- **Feature Planning**: Understand current user paths

## 🔒 Security & Privacy

- **Hyperbrowser Security**: Enterprise-grade bot detection bypass
- **Data Privacy**: No data stored permanently
- **Secure Processing**: All crawling happens server-side
- **API Key Protection**: Keys are not logged or stored

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
vercel --prod
```

### Docker Deployment
```bash
docker build -t flow-mapper .
docker run -p 3000:3000 flow-mapper
```

### Environment Setup
Ensure these environment variables are set in production:
- `HYPERBROWSER_API_KEY`
- `NEXT_PUBLIC_SITE_DOMAIN`

## 🛠️ Development

### Project Structure
```
flow-mapper/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Core functionality
│   ├── crawl.ts        # Hyperbrowser integration
│   ├── graph.ts        # Flow graph generation
│   ├── codegen.ts      # Code generation
│   └── zip.ts          # File packaging
└── public/             # Static assets
```

### Key Components
- **Crawler**: Hyperbrowser SDK integration
- **GraphBuilder**: Flow diagram generation
- **CodeGenerator**: Multi-format code export
- **ZipBuilder**: Downloadable package creation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Hyperbrowser API
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Hyperbrowser Docs](https://docs.hyperbrowser.ai)
- **Issues**: GitHub Issues
- **Contact**: [Hyperbrowser Support](https://hyperbrowser.ai/)

---

*FlowMapper demonstrates the power of Hyperbrowser SDK for enterprise web automation and testing. Built with modern web technologies and designed for scalability.*
