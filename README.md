# TILIL Insurance AI Assistant

AI chatbot for **Trust Islami Life Insurance PLC** — powered by **GitHub Models API** (free GPT-4o access with your GitHub token).

Built with Next.js 14 + TypeScript + Streaming SSE.

---

## Setup (3 Steps)

### Step 1 — Get your GitHub Token

1. Go to **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like `tilil-assistant`
4. **No special permissions needed** — just leave all checkboxes unchecked
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_...`)

### Step 2 — Configure the project

```bash
cd tilil-assistant
npm install
```

Create `.env.local` in the project root:

```bash
GITHUB_TOKEN=ghp_paste_your_token_here
```

### Step 3 — Run

```bash
npm run dev
```

Open **http://localhost:3000** — done!

---

## How It Works

```
User types question
        ↓
Next.js API Route (/api/chat)
        ↓
GitHub Models API (https://models.inference.ai.azure.com)
  → Uses your GITHUB_TOKEN
  → Sends TILIL docs as system prompt
  → Streams response via GPT-4o-mini
        ↓
Real-time streaming response in chat UI
```

---

## Project Structure

```
tilil-assistant/
├── .env.local              ← YOUR GITHUB TOKEN GOES HERE
├── app/
│   ├── api/chat/route.ts   ← GitHub Models API endpoint
│   ├── lib/system-prompt.ts ← Full TILIL knowledge base
│   ├── components/
│   │   └── ChatInterface.tsx ← Chat UI
│   ├── globals.css          ← Styles
│   ├── layout.tsx
│   └── page.tsx
├── package.json
└── README.md
```

---

## Change AI Model

In `app/api/chat/route.ts`, change the model:

```ts
model: "gpt-4o-mini",              // Default (fast, free tier friendly)
model: "gpt-4o",                   // Most capable
model: "Meta-Llama-3.1-405B-Instruct", // Open source alternative
model: "Mistral-Large",            // Mistral's flagship
```

See all available models: https://github.com/marketplace/models

---

## Features

- Bilingual: Bangla + English + Banglish auto-detection
- Streaming: Real-time token-by-token responses
- 11+ TILIL insurance plans fully documented
- Group/Health insurance coverage
- Quick suggestion buttons
- Markdown rendering (tables, lists, bold, headings)
- Mobile responsive
- Safety guardrails built-in

---

## Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `GITHUB_TOKEN` as environment variable
4. Deploy

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "GitHub Token not configured" | Create `.env.local` with `GITHUB_TOKEN=ghp_...` |
| "Invalid GitHub Token" | Regenerate token at github.com/settings/tokens |
| "Rate limit exceeded" | Wait 60 seconds. GitHub Models has per-minute limits |
| "Model not found" | Check model name in route.ts against github.com/marketplace/models |

---

## License

Educational project. TILIL product data from publicly available information at www.trustislamilife.com.
