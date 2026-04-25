# GEO Dashboard 🌐

> AI Search Visibility Tracker for D2C Brands

Monitor your brand's citations across ChatGPT, Perplexity, and Gemini — the AI search engines that are reshaping how consumers discover products.

---

## The Problem

D2C brands are losing visibility as consumers shift from Google to AI search engines. AI search referrals convert at **9-23x the rate** of traditional organic search, but most brands have no visibility into whether they're being recommended.

GEO Dashboard fixes that.

---

## Features

- 🔍 **Citation Monitoring** — Track if your brand is mentioned when users ask AI assistants for product recommendations
- 🤖 **Multi-Engine Support** — Check ChatGPT, Perplexity, and Gemini simultaneously
- 🏆 **Competitor Tracking** — See which competitors are getting mentioned instead of you
- 📊 **Position Tracking** — Know where your brand ranks in AI responses (1–10 prominence score)

---

## How It Works

1. Add your brand (name + website)
2. Enter search queries like *"best sneakers for running in India"*
3. The system queries multiple AI engines and analyzes responses
4. View results showing mention status, position, and competitors found

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + React 19 |
| Styling | Tailwind CSS |
| Database | Prisma + SQLite |
| AI Engines | OpenRouter API (GPT-4o, Claude, Gemini, Perplexity) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

### Installation

```bash
# Clone the repository
git clone https://github.com/SK-AIPM404/geo-audit.git
cd geo-audit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Set up the database
npx prisma migrate dev

# Start the development server
npm run dev
```

---


---

## Roadmap

- [ ] Scheduled automatic monitoring
- [ ] Email/Slack alerts for citation changes
- [ ] Historical trend charts
- [ ] API access for enterprise brands
- [ ] Support for more AI engines (Grok, Claude.ai)

---

## License

MIT
