# GEO Dashboard

AI Search Visibility Tracker for D2C Brands. Monitor your brand's citations in ChatGPT, Perplexity, and Gemini.

## The Problem

D2C brands are losing visibility as consumers shift from Google to AI search engines. AI search referrals convert at 9-23x the rate of traditional organic search, but most brands have no visibility into whether they're being recommended.

## Features

- **Citation Monitoring** - Track if your brand is mentioned when users ask AI assistants for product recommendations
- **Multi-Engine Support** - Check ChatGPT, Perplexity, and Gemini simultaneously
- **Competitor Tracking** - See which competitors are getting mentioned instead of you
- **Position Tracking** - Know where your brand ranks in AI responses (1-10 prominence score)

## Tech Stack

- Next.js 16 + React 19
- Prisma 7 + SQLite
- Tailwind CSS
- OpenRouter API (access GPT, Claude, Gemini, Perplexity with one key)

## Setup

1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/geo-dashboard.git
cd geo-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

4. Initialize the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Add your brand (name + website)
2. Enter search queries like "best sneakers for running in India"
3. Click "Check Citation" to query AI engines
4. View results showing if your brand was mentioned, position, and competitors

## API Keys

Get an OpenRouter API key at [openrouter.ai](https://openrouter.ai) - this gives you access to all models with one key.
