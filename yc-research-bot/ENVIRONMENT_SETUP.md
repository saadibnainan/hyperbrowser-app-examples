# Environment Setup Guide

## Required Environment Variables

To fix the OpenAI API key error, you need to create a `.env` file in the root directory with the following variables:

### 1. Create `.env` file
```bash
touch .env
```

### 2. Add Required Variables
```bash
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Hyperbrowser Configuration (REQUIRED for web scraping)
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here

# Optional integrations

SLACK_BOT_TOKEN=xoxb-your_slack_bot_token_here
SLACK_CHANNEL_ID=your_slack_channel_id_here
```

### 3. Get Your API Keys

**OpenAI API Key:**
- Go to https://platform.openai.com/api-keys
- Create a new API key
- Copy and paste it in your `.env` file

**Hyperbrowser API Key:**
- Sign up at https://hyperbrowser.ai
- Get your API key from the dashboard
- Add it to your `.env` file

### 4. Restart Development Server
After adding the environment variables:
```bash
npm run dev
```

## Troubleshooting

If you're still getting the OpenAI API key error:
1. Make sure the `.env` file is in the root directory (same level as `package.json`)
2. Ensure there are no spaces around the `=` sign
3. Restart your development server after making changes
4. Check that your OpenAI API key starts with `sk-` 