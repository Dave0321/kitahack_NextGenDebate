# KitaHack Project Structure

Generated: February 23, 2026 (Updated)

## Project Overview

This is a Next.js 16 application for AI-powered debating platform with UN SDG (Sustainable Development Goals) focus. Features include real-time debate moderation with Google Gemini 2.0 Flash and fallback bad-words detection. The project uses React, TypeScript, Tailwind CSS, and integrates with Google's Generative AI API.

---

## Directory Structure

### Root Configuration Files

```
├── components.json                 # UI component configuration
├── next.config.mjs                # Next.js configuration
├── next-env.d.ts                  # Next.js TypeScript definitions
├── package.json                   # NPM dependencies & scripts
├── package-lock.json             # NPM lock file
├── pnpm-lock.yaml                # PNPM lock file
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.tsbuildinfo          # TypeScript build info
└── project-structure.md          # This file
```

---

## Directory Tree

```
kitahack-main/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main home page
│   ├── layout.tsx               # Root layout component
│   ├── globals.css              # Global styles
│   ├── friends/
│   │   └── page.tsx             # Friends page route
│   └── learning/
│       └── page.tsx             # Learning page route
│
├── components/                   # React components
│   ├── app-shell.tsx            # Main app shell/layout wrapper
│   ├── theme-provider.tsx       # Theme provider setup
│   │
│   ├── debate/                  # Debate-related components
│   │   ├── card-section.tsx
│   │   ├── card-view-modal.tsx
│   │   ├── challenge-detail-modal.tsx
│   │   ├── create-card-modal.tsx
│   │   ├── debate-card-item.tsx
│   │   ├── debate-room-page.tsx
│   │   ├── dedicated-topic-page.tsx
│   │   ├── expanded-list-page.tsx
│   │   ├── raise-challenge-modal.tsx
│   │   ├── schedule-debate-modal.tsx
│   │   ├── stance-picker-modal.tsx
│   │   ├── youtube-challenge-card.tsx
│   │   ├── youtube-challenge-section.tsx
│   │   └── youtube-player.tsx
│   │
│   ├── learning/                # Learning hub components
│   │   ├── learning-detail-modal.tsx
│   │   └── learning-expanded-page.tsx
│   │
│   ├── onboarding/              # Onboarding flow components
│   │   └── profile-setup.tsx
│   │
│   ├── pages/                   # Full-page components
│   │   ├── auth-page.tsx
│   │   ├── browse-page.tsx
│   │   ├── friends-page.tsx
│   │   ├── learning-hub-page.tsx
│   │   └── profile-page.tsx
│   │
│   └── ui/                      # Reusable UI components (shadcn/ui)
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── alert-dialog.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── button-group.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── empty.tsx
│       ├── field.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input.tsx
│       ├── input-group.tsx
│       ├── input-otp.tsx
│       ├── item.tsx
│       ├── kbd.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       ├── toaster.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       ├── tooltip.tsx
│       ├── use-mobile.tsx
│       └── use-toast.ts
│
├── hooks/                       # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                         # Utility functions and models
│   ├── utils.ts                 # General utility functions
│   │
│   ├── data/
│   │   └── sdg-data.ts         # SDG (Sustainable Development Goals) data
│   │
│   ├── models/                  # Data models and business logic
│   │   ├── debate-card.ts
│   │   ├── debate-history.ts
│   │   ├── friend.ts
│   │   ├── learning-card.ts
│   │   ├── moderation.ts       # ⭐ Moderation data models (QualityFlag, DebateMessage, ModerationResult)
│   │   ├── user-profile.ts
│   │   └── youtube-challenge.ts
│   │
│   └── utils/                   # Specialized utilities
│       ├── debate-moderator.ts # ⭐ Two-layer moderation service (Gemini + bad-words fallback)
│       └── youtube.ts           # YouTube URL parsing utilities
│
├── styles/                      # Global stylesheets
│   └── globals.css

└── [Configuration files at root level - see above]
```

---

## File Count Summary

| Directory | File Count |
|-----------|-----------|
| app/ | 4 files |
| components/debate/ | 14 files |
| components/learning/ | 2 files |
| components/onboarding/ | 1 file |
| components/pages/ | 5 files |
| components/ui/ | 56 files |
| components/ (root level) | 2 files |
| hooks/ | 2 files |
| lib/data/ | 1 file |
| lib/models/ | 7 files |
| lib/utils/ | 2 files |
| lib/ (root level) | 1 file |
| styles/ | 1 file |
| Root config files | 9 files |
| **TOTAL** | **~107 files** |

---

## Key Component Directories

### `/app` - Next.js App Router
- Main application pages and application shell
- Entry point: `app/layout.tsx` and `app/page.tsx`

### `/components` - React Components
- **ui/**: shadcn/ui component library (60+ prebuilt components)
- **pages/**: Full-page view components
- **debate/**: Debate-related features and UI
- **learning/**: Learning hub and educational content
- **onboarding/**: User onboarding flow

### `/lib` - Business Logic & Utilities
- **models/**: Data classes and interfaces
  - UserProfile, Friend, DebateCard, LearningCard, etc.
- **data/**: Static data (SDG goals and descriptions)
- **utils/**: Helper functions

### `/hooks` - Custom React Hooks
- Reusable logic hooks (toast notifications, mobile detection)

### `/styles` - Global Styling
- Global CSS and theme configuration

---

## Technology Stack

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5.7.3
- **UI Framework**: React 19.2.4
- **Component Library**: shadcn/ui (Radix UI base)
- **Styling**: Tailwind CSS 4.1.9
- **Icons**: Lucide React
- **Form Management**: React Hook Form 7.54.1
- **AI Moderation**: Google Generative AI (Gemini 2.0 Flash)
- **Content Filtering**: bad-words library 4.0.0
- **Toast Notifications**: Sonner 1.7.1
- **Data Fetching**: (Currently using mock data - no backend configured)
- **Backend**: None (Frontend only - mock data)

---

## Notes

### Implemented Features ✅

1. **Two-Layer Moderation System** (Session 1 Complete)
   - **Layer 1**: Google Gemini 2.0 Flash with 5-second timeout
   - **Layer 2**: bad-words library + relevancy keyword matching (fallback)
   - Integration in `components/debate/debate-room-page.tsx`
   - Real-time moderation with visual feedback (toast, dialog, score penalty)
   - User score tracking (starts at 100, -10 per warning)

2. **Moderation Data Structures**
   - `QualityFlag`: Stores soft-rule violations (fallacy detection reserved for post-debate)
   - `DebateMessage`: Message with role, content, and optional flags
   - `ModerationResult`: Verdict (block/warn/pass), feedback, score impact

### In Progress / Future Work

3. **Post-Debate Summary Service** (Session 2 - Not Started)
   - Will consume qualityFlags from debate history
   - Generate AI skill report using Gemini 2.0
   - Detect fallacies (Ad Hominem, Strawman, etc.)
   - Create skill cards showing user strengths/weaknesses

### Planned Improvements

- Replace bad-words fallback with detoxify Python microservice for ML-based detection
- Implement three-strikes escalation (cumulative warnings → auto-block)
- Expand fallacy detection to full history analysis (Strawman, Moving the Goalposts)

### Currently Not Integrated

- **Backend/Database**: No Firebase or backend yet - using mock data
- **Authentication**: Mock auth system only
- **Environment Variables**: Requires `.env.local` with `NEXT_PUBLIC_GEMINI_API_KEY`

---

## Important Files

- `app/page.tsx` - Main application shell and state management
- `components/pages/auth-page.tsx` - Authentication UI
- `components/app-shell.tsx` - Overall app layout
- `components/debate/debate-room-page.tsx` - Debate UI with moderation integration
- `lib/models/moderation.ts` - Moderation data models
- `lib/utils/debate-moderator.ts` - Two-layer moderation service
- `lib/models/` - Core data structures
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

---

## Moderation System Architecture

### Flow Diagram

```
User sends message in debate
        ↓
debate-room-page.tsx calls DebateModerator.checkRules()
        ↓
Layer 1: Gemini 2.0 Flash (Primary)
  ├─ Sends message + debate context to Gemini API
  ├─ 5-second timeout via Promise.race()
  ├─ Returns ModerationResult on success
  └─ Falls to Layer 2 on timeout/error/parse failure
        ↓
Layer 2: bad-words + Relevancy (Fallback)
  ├─ Check profanity with Filter.isProfane()
  ├─ Check off-topic (zero keyword overlap, >10 words)
  └─ Return ModerationResult (block/warn/pass)
        ↓
UI Response:
  ├─ BLOCK verdict → Red error toast (message not sent)
  ├─ WARN verdict → Dialog (Edit or Proceed -10 pts)
  └─ PASS verdict → Message sent normally
```

### Moderation Rules

| Verdict | Condition | Score Impact | User Experience |
|---------|-----------|--------------|-----------------|
| **BLOCK** | Hate speech, slurs, personal attacks | 0 | Red error toast, message blocked |
| **WARN** | Off-topic message (zero keyword match, >10 words) | -10 | Dialog: "Edit Message" or "Proceed Anyway" |
| **PASS** | Clean, relevant argument | 0 | Message sent normally |

### Quality Flags

- Stored in message.flags[] for post-debate summary
- Currently always returns [] from DebateModerator (soft-rule detection reserved for post-debate service)
- Example soft flags: Ad Hominem, Strawman (not enforced during debate, only recorded)

---

## Configuration

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=<your-google-generative-ai-key>
```

Get your API key from: https://makersuite.google.com/app/apikey

### Package Dependencies (Moderation)

```json
"@google/generative-ai": "^0.24.1",
"bad-words": "^4.0.0",
"@types/bad-words": "^3.0.3"
```

---

