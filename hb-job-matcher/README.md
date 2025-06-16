# HB Job Matcher

An AI-powered job matching application that uses **Hyperbrowser** to extract information from portfolio websites and resumes, then finds matching job opportunities.

![HB Job Matcher](https://img.shields.io/badge/Powered%20by-Hyperbrowser-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

- **Smart Profile Extraction**: Uses Hyperbrowser AI to extract skills, experience, and other relevant information from portfolio websites, Google Drive resumes, and Google Docs
- **Google Drive Integration**: Seamlessly works with Google Drive sharing links and Google Docs
- **Intelligent Job Matching**: Finds relevant job opportunities based on extracted profile data
- **Real-time Processing**: Live updates during profile extraction and job matching
- **Modern UI**: Clean, responsive interface with dark theme
- **API Key Management**: Secure local storage of Hyperbrowser API credentials
- **Match Scoring**: Intelligent scoring system for job relevance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.3, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Automation**: Hyperbrowser SDK, Puppeteer Core
- **Styling**: Tailwind CSS with custom dark theme

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (version 18 or higher)
2. **Hyperbrowser API Key** - Get one at [hyperbrowser.ai](https://www.hyperbrowser.ai/)

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hb-job-matcher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Hyperbrowser SDK** (when available)
   ```bash
   npm install @hyperbrowser/sdk puppeteer-core
   ```

4. **Start the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### API Key Setup

1. Click the "Get Hyperbrowser API Key" button in the header
2. This opens a sidebar where you can:
   - Enter your Hyperbrowser API key
   - Get information about Hyperbrowser
   - Access the official Hyperbrowser website

Your API key is stored locally in your browser and is used to authenticate requests to the Hyperbrowser service.

## 🎯 How to Use

1. **Configure API Key**: Click "Get Hyperbrowser API Key" and enter your API key
2. **Enter URL**: Paste the URL of a portfolio website, Google Drive resume, or Google Docs resume
3. **Extract Profile**: Click "Analyze & Find Jobs" to start the extraction process
4. **View Results**: See the extracted profile information and matching job opportunities
5. **Explore Matches**: Review job matches with relevance scores and apply directly

## 🔄 How It Works

### Profile Extraction Process

1. **URL Validation**: The application validates the provided URL
2. **Hyperbrowser Session**: Creates a new browser session using your API key
3. **Smart Extraction**: Uses AI-powered selectors to extract:
   - Personal information (name, title, location)
   - Skills and technologies
   - Work experience
   - Education background
   - Professional summary

### Supported URL Formats

The application supports various URL formats:
- **Portfolio websites**: `https://yourname.dev`, `https://github.com/username`
- **Google Drive files**: `https://drive.google.com/file/d/FILE_ID/view`
- **Google Docs**: `https://docs.google.com/document/d/DOCUMENT_ID`
- **Direct PDF links**: Any direct PDF URL

### Job Matching Algorithm

1. **Skill Analysis**: Analyzes extracted skills against job requirements
2. **Experience Matching**: Matches experience level with job seniority
3. **Location Preferences**: Considers location compatibility
4. **Scoring System**: Calculates match percentage based on:
   - Skill overlap (70% weight)
   - Title similarity (20% weight)
   - Location match (10% weight)

## 🗂️ Project Structure

```
hb-job-matcher/
├── app/
│   ├── api/
│   │   ├── extract-profile/
│   │   │   └── route.ts          # Profile extraction API
│   │   └── find-jobs/
│   │       └── route.ts          # Job matching API
│   ├── components/
│   │   ├── JobMatcher.tsx        # Main application component
│   │   └── Sidebar.tsx           # API key management sidebar
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── package.json
└── README.md
```

## 🔌 API Endpoints

### POST `/api/extract-profile`
Extracts profile information from a given URL.

**Request Body:**
```json
{
  "url": "https://example.com/portfolio",
  "apiKey": "your-hyperbrowser-api-key"
}
```

**Response:**
```json
{
  "profileData": {
    "name": "John Doe",
    "title": "Software Engineer",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": "5 years of experience...",
    "education": "BS Computer Science",
    "location": "San Francisco, CA",
    "summary": "Experienced developer..."
  }
}
```

### POST `/api/find-jobs`
Finds matching jobs based on extracted profile data.

**Request Body:**
```json
{
  "profile": { /* ExtractedProfile object */ },
  "apiKey": "your-hyperbrowser-api-key"
}
```

**Response:**
```json
{
  "jobMatches": [
    {
      "id": "job-1",
      "title": "Senior Software Engineer",
      "company": "TechCorp",
      "location": "Remote",
      "matchScore": 95,
      "description": "Job description...",
      "requirements": ["JavaScript", "React"],
      "url": "https://example.com/job"
    }
  ]
}
```

## 🔮 Future Enhancements

When the Hyperbrowser SDK is fully integrated, this application will support:

- **Real-time Job Scraping**: Live scraping from Indeed, LinkedIn, Stack Overflow Jobs
- **Advanced AI Extraction**: More sophisticated profile data extraction
- **Multiple Format Support**: PDF resume parsing, LinkedIn profile import
- **Job Application Automation**: Automated job application submission
- **Email Notifications**: Alerts for new matching opportunities
- **Analytics Dashboard**: Track application success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hyperbrowser Team** for providing the powerful browser automation platform
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

- **Hyperbrowser Documentation**: [docs.hyperbrowser.ai](https://docs.hyperbrowser.ai)
- **Hyperbrowser Website**: [hyperbrowser.ai](https://www.hyperbrowser.ai/)
- **Issues**: Please report bugs and feature requests via GitHub issues

---

**Powered by [Hyperbrowser](https://www.hyperbrowser.ai/)**
