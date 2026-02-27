# 🗣️ DebateMe — AI-Powered Debate Platform

> **KitaHack Prototype** · A next-generation debate platform focused on UN Sustainable Development Goals (SDGs), powered by Google Gemini AI.

---

## 📖 Overview

**DebateMe** is an AI-enhanced debating platform that helps users sharpen their argumentation skills, explore global issues through the lens of the UN's 17 Sustainable Development Goals (SDGs), and engage in structured debates — either against real players or an AI opponent.

The platform features a **two-layer real-time moderation system** powered by **Google Gemini 2.0 Flash** to ensure respectful, on-topic debate discourse.

---

## ✨ Features

### 🏟️ The Arena (Browse & Debate)
- **Live & Upcoming Matches** — View open challenges, join instantly, or schedule future debates
- **Raise a Challenge** — Post a debate topic as an open invitation to other users
- **Train with AI** — Start an AI-moderated debate session against a Gemini-powered opponent
- **Explore Topics** — Browse trending and recommended debate cards organized by SDG tags
- **Stance Picker** — Choose to argue Pro or Con before entering a debate room
- **YouTube Integration** — Each debate card links to a relevant YouTube video for context

### 💬 Debate Room
- **Real-time Chat Interface** — Live messaging between debaters (Pro vs Con)
- **AI Moderation** — Google Gemini 2.0 Flash checks every message in real-time
- **Score Tracking** — Users start at 100 points; inappropriate messages cost -10 pts
- **Message Moderation Verdicts:**
  | Verdict | Trigger | Action |
  |---------|---------|--------|
  | ✅ PASS | Clean, relevant argument | Message sent normally |
  | ⚠️ WARN | Off-topic message | Dialog: Edit or Proceed (-10 pts) |
  | 🚫 BLOCK | Hate speech / personal attacks | Message blocked with error toast |

### 📚 Learning Hub (The Academy)
- **Logical Fallacies** — Learn to identify and counter common reasoning errors (Ad Hominem, Strawman, etc.)
- **SDG Learning** — Explore all 17 UN Sustainable Development Goals with curated content
- **General Lessons** — Critical thinking, fact-checking, and misinformation detection
- Expandable cards with detail modals for in-depth reading

### 👥 Social Features
- **Friends Page** — View and manage your debate connections
- **Profile Page** — Track your debate history, score, and achievements
- **Onboarding Flow** — Profile setup for new users

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16.1.6](https://nextjs.org/) (App Router) |
| Language | TypeScript 5.7.3 |
| UI Library | React 19.2.4 |
| Component Library | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| Styling | Tailwind CSS 4.1.9 |
| Icons | Lucide React |
| AI Moderation | Google Generative AI — Gemini 2.0 Flash |
| Content Filtering | `bad-words` v4.0.0 (fallback layer) |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Analytics | Vercel Analytics |

> **Backend**: Frontend-only prototype. Uses `localStorage` for persistence. No database or authentication backend configured.

---

## 🏗️ Project Structure

```
debate-me-platform-prototype/
├── app/                        # Next.js App Router
│   ├── page.tsx               # Main entry / app shell state
│   ├── layout.tsx             # Root layout & theme
│   ├── friends/page.tsx       # Friends route
│   └── learning/page.tsx      # Learning hub route
│
├── components/
│   ├── debate/                # Debate arena components
│   │   ├── debate-room-page.tsx        # Live debate room (with moderation)
│   │   ├── raise-challenge-modal.tsx   # Post a new challenge
│   │   ├── challenge-detail-modal.tsx  # View challenge details
│   │   ├── stance-picker-modal.tsx     # Pro / Con selection
│   │   ├── youtube-challenge-section.tsx
│   │   └── ...
│   ├── learning/              # Learning Hub components
│   ├── pages/                 # Full-page views (Browse, Friends, Profile, etc.)
│   └── ui/                    # shadcn/ui base components (60+)
│
├── lib/
│   ├── models/                # Data models
│   │   ├── debate-card.ts
│   │   ├── youtube-challenge.ts
│   │   ├── moderation.ts      # ModerationResult, DebateMessage, QualityFlag
│   │   └── ...
│   ├── utils/
│   │   ├── debate-moderator.ts  # ⭐ Two-layer AI moderation service
│   │   └── youtube.ts           # YouTube URL utilities
│   └── data/
│       └── sdg-data.ts          # UN SDG definitions & metadata
│
└── styles/
    └── globals.css
```

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A **Google Gemini API key** — [Get one here](https://makersuite.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd debate-me-platform-prototype

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Configure environment variables
cp .env.example .env.local
# Then edit .env.local and add your key:
# NEXT_PUBLIC_GEMINI_API_KEY=<your-google-generative-ai-key>

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | ✅ Yes | Google Generative AI key for Gemini 2.0 Flash moderation |

---

## 🤖 AI Moderation Architecture

Every message sent in the debate room passes through a **two-layer moderation pipeline**:

```
User sends message
        ↓
Layer 1 — Google Gemini 2.0 Flash
  ├─ Sends message + debate context to Gemini API
  ├─ 5-second timeout (Promise.race)
  └─ Falls to Layer 2 on timeout / error / parse failure
        ↓
Layer 2 — bad-words + Relevancy Fallback
  ├─ Profanity check via Filter.isProfane()
  └─ Off-topic check (zero keyword overlap, >10 words)
        ↓
UI Response
  ├─ BLOCK  → Red error toast (message not sent)
  ├─ WARN   → Dialog: "Edit Message" or "Proceed Anyway -10 pts"
  └─ PASS   → Message sent normally
```

Key files:
- [`lib/utils/debate-moderator.ts`](lib/utils/debate-moderator.ts) — Moderation service
- [`lib/models/moderation.ts`](lib/models/moderation.ts) — `ModerationResult`, `DebateMessage`, `QualityFlag`
- [`components/debate/debate-room-page.tsx`](components/debate/debate-room-page.tsx) — Moderation integration

---

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🗺️ Roadmap

- [x] Two-layer real-time moderation (Gemini + bad-words fallback)
- [x] Live debate room with real-time chat
- [x] AI training sessions (debate vs AI opponent)
- [x] SDG-tagged debate cards (11 topics)
- [x] Learning Hub (Fallacies, SDGs, General Lessons)
- [x] Join Instantly button for live challenges
- [ ] Post-debate AI summary & skill report (fallacy detection)
- [ ] Firebase backend & real authentication
- [ ] Three-strikes escalation system
- [ ] ML-based content moderation (detoxify microservice)
- [ ] Real-time multiplayer via WebSockets

---

## 🤝 Contributing

This is a hackathon prototype built for **KitaHack**. Contributions and feedback are welcome!

---

## 📄 License

This project is a prototype developed for **KitaHack** and is not yet licensed for public distribution.
