# ChurnHunter 🎯

CLI tool to analyze signup/demo flows for churn risk using HyperBrowser automation and OpenAI analysis.

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   # Or export them directly:
   export HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
   export OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get API Keys:**
   - **HyperBrowser API Key**: Get from [https://hyperbrowser.ai](https://hyperbrowser.ai)
   - **OpenAI API Key**: Get from [https://platform.openai.com](https://platform.openai.com/)

## Usage

```bash
# Run with URL prompt
npx ts-node churnhunter.ts

# Run with direct URL
npx ts-node churnhunter.ts --url https://example.com

# Get JSON output
npx ts-node churnhunter.ts --json --url https://example.com

# Show help
npx ts-node churnhunter.ts --help
```

## Exit Codes

- `0` - Low churn risk (score < 70)
- `1` - High churn risk (score ≥ 70) 
- `2` - Error occurred

## What it does

1. **Automated Crawling**: Uses HyperBrowser to simulate a real user going through your signup/demo flow
2. **AI Analysis**: Sends the captured events to GPT-4o for UX analysis
3. **Risk Scoring**: Gets a 0-100 churn risk score with specific friction points
4. **Actionable Report**: Shows colored CLI report with recommendations

## Sample Output

```
🎯 ChurnHunter Analysis Report
══════════════════════════════════════════════════
URL: https://example.com
Churn Risk Score: 45/100
Risk Level: MODERATE

⚠️  Friction Points:
┌──────────────────────────────────────┬────────────────────────────────────────────────────────────┐
│ Issue                                │ Recommendation                                             │
├──────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Signup form has too many fields      │ Reduce required fields to email and password only         │
│ No clear value proposition shown     │ Add benefit statements above the signup form              │
└──────────────────────────────────────┴────────────────────────────────────────────────────────────┘

Events captured: 23
══════════════════════════════════════════════════
``` 