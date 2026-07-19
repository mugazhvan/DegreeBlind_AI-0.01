# Analyser AI — Frontend Walkthrough

## What was built

A complete React + TypeScript + Tailwind CSS v4 frontend for **Analyser AI** inside `d:\ReMAP-MG\DegreeBlind`. The project is a clean, minimal student-style application with no fake data — all sections use realistic placeholders like "Pending Analysis" or "Waiting for backend" until a real backend is connected.

## Project Structure

```
DegreeBlind/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          — Top nav with active link highlighting + mobile menu
│   │   ├── RepositoryInput.tsx — GitHub URL input + "Analyse Repository" button
│   │   ├── RepositoryCard.tsx  — Full repo metadata display (14 fields)
│   │   ├── LanguageCard.tsx    — Language distribution bars
│   │   ├── AnalysisCard.tsx    — AI analysis parameters (8 skills + summary)
│   │   ├── StatusCard.tsx      — Generic placeholder card for missing data
│   │   ├── LoadingTimeline.tsx — Sequential loading steps with icons
│   │   ├── ReportSection.tsx   — Reusable report section wrapper
│   │   └── Footer.tsx          — Simple footer
│   ├── pages/
│   │   ├── Dashboard.tsx       — Landing page with heading + input + stat cards
│   │   ├── AnalysisPage.tsx    — Loading timeline → redirects to report
│   │   ├── ReportPage.tsx      — Full report layout (6 sections)
│   │   └── About.tsx           — Project explanation
│   ├── types/
│   │   └── index.ts            — TypeScript interfaces (RepositoryData, AIAnalysisReport, etc.)
│   ├── services/
│   │   └── api.ts              — API stubs (getRepository, getAnalysis, getReport)
│   ├── hooks/
│   │   └── index.ts            — Placeholder for future hooks
│   ├── utils/
│   │   └── index.ts            — Placeholder for future utilities
│   ├── data/
│   │   └── index.ts            — Placeholder for future static data
│   ├── assets/
│   ├── App.tsx                 — BrowserRouter with 4 routes
│   ├── main.tsx                — Entry point
│   └── index.css               — Tailwind v4 import + system fonts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Main landing with heading, subtitle, repo URL input, and 3 stat cards (showing "Waiting for backend") |
| Analysis | `/analysis` | Sequential loading timeline (5 stages), then auto-redirects to report |
| Report | `/report` | Full report with Repository Overview, Technical Analysis, Code Review, AI Summary, Suggestions & Roles |
| About | `/about` | Plain English project explanation + tech stack |

## Key Design Decisions

- **No fake data**: All statistics, scores, and percentages show placeholder text instead of invented numbers
- **Backend-ready**: Every component accepts props via TypeScript interfaces. API service stubs (`getRepository()`, `getAnalysis()`, etc.) return `null` and can be swapped for real fetch calls
- **Tailwind CSS v4**: Uses `@import "tailwindcss"` syntax with `@tailwindcss/postcss` plugin
- **Inline GitHub SVG**: `lucide-react` v0.47+ removed the GitHub icon, so a standard SVG is used directly
- **Student aesthetic**: White background, gray borders, blue buttons, system fonts, no glassmorphism/gradients

## Build Verification

- ✅ `npm run build` — TypeScript compiles with zero errors
- ✅ All `import type` statements used correctly for `verbatimModuleSyntax`
- ✅ Production bundle: 254 KB JS (80 KB gzipped), 19 KB CSS (4 KB gzipped)

## How to Run

```bash
cd d:\ReMAP-MG\DegreeBlind
npm run dev
```
