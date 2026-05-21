# TILIL Insurance AI Assistant v3

AI chatbot for **Trust Islami Life Insurance PLC** — powered by **GitHub Models API**.

Built with **Next.js 14 · Tailwind CSS · Framer Motion · Lucide Icons · TypeScript**

---

## Features

- **Light/Dark Mode** — System-aware toggle with localStorage persistence and smooth transitions
- **Voice Input** — Speak in Bangla or English using the browser SpeechRecognition API
- **5 Quick Action Cards** — New Policy, Premium Policy, Existing Policy, Claim, Help
- **Bilingual Support** — Auto-detects and responds in Bangla, English, or Banglish
- **Streaming Responses** — Real-time token-by-token via Server-Sent Events
- **Full TILIL Knowledge Base** — All insurance plans, group/health products, glossary
- **Markdown Rendering** — Tables, lists, bold, headings, blockquotes, code
- **Fully Responsive** — Mobile-first design, works on all screen sizes
- **Accessible** — Keyboard navigation, aria-labels, focus outlines, proper contrast

---

## Quick Start

### 1. Install dependencies

```bash
cd tilil-assistant
npm install
```

### 2. Set up your GitHub Token

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
GITHUB_TOKEN=ghp_your_actual_github_token
```

**How to get a GitHub Token:**

1. Visit https://github.com/marketplace/models — accept terms if prompted
2. Go to https://github.com/settings/tokens
3. Click "Generate new token (classic)"
4. Name it (e.g., `tilil-bot`), leave all permission checkboxes unchecked
5. Generate and copy the `ghp_...` token

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000**

---

## Project Structure

```
tilil-assistant/
├── .env.local                    ← YOUR GITHUB TOKEN
├── app/
│   ├── api/chat/
│   │   └── route.ts              ← GitHub Models streaming API
│   ├── components/
│   │   ├── ChatInterface.tsx     ← Main chat UI
│   │   ├── ThemeProvider.tsx     ← Dark/Light mode with localStorage
│   │   └── VoiceInput.tsx        ← Speech recognition component
│   ├── lib/
│   │   └── system-prompt.ts      ← Full TILIL knowledge base
│   ├── globals.css               ← Tailwind + custom styles
│   ├── layout.tsx                ← Root layout with ThemeProvider
│   └── page.tsx                  ← Home page
├── tailwind.config.js            ← Tailwind dark mode config
├── postcss.config.js
├── package.json
└── README.md
```

---

## Component Architecture

| Component | Purpose |
|-----------|---------|
| `ThemeProvider` | React context for dark/light mode, localStorage sync, system preference detection |
| `VoiceInput` | SpeechRecognition API wrapper with pulse animation, error toasts, Bangla/English support |
| `ChatInterface` | Main chat with header, action cards, messages, streaming, input area |

---

## Configuration

### Change AI Model

In `app/api/chat/route.ts`:

```ts
model: "gpt-4o-mini",                   // Default (fast)
model: "gpt-4o",                         // Most capable
model: "Meta-Llama-3.1-405B-Instruct",  // Open source
model: "Mistral-Large",                  // Mistral flagship
```

All models at: https://github.com/marketplace/models

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| Next.js 14 | App Router, API Routes, SSE streaming |
| TypeScript | Type-safe components and API |
| Tailwind CSS | Utility-first styling with dark mode class strategy |
| Framer Motion | Card animations, typing indicator, theme transitions |
| Lucide React | Premium icon set (ShieldCheck, Crown, Mic, Send, etc.) |
| OpenAI SDK | GitHub Models API client (OpenAI-compatible) |
| react-markdown | Markdown rendering for AI responses |
| SpeechRecognition API | Browser-native voice input |

---

## Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `GITHUB_TOKEN` as environment variable
4. Deploy — done

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "GitHub Token not configured" | Create `.env.local` with `GITHUB_TOKEN=ghp_...` |
| "Invalid GitHub Token" | Regenerate at github.com/settings/tokens |
| "Rate limit exceeded" | Wait 60 seconds and retry |
| Voice input not working | Use Chrome/Edge (Firefox has limited SpeechRecognition support) |
| Dark mode not persisting | Check localStorage is enabled in your browser |

---

## License

Educational project. TILIL product data from publicly available information at www.trustislamilife.com.
