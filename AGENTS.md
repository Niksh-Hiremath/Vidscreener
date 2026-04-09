# VidScreener — Claude Code Context

## What This Project Is

VidScreener is an **AI-assisted video evaluation platform** that transforms unstructured video submissions into structured, explainable, and scalable assessments. It serves admissions programs, hiring pipelines, and fellowship selection — anywhere organizations need to screen many video submissions efficiently.

The platform replaces fragmented manual workflows (SharePoint folders, Excel spreadsheets, manual downloads) with one unified system that combines multimodal AI with human evaluators.

---

## The Problem We Solve

Real-world grounding: Plaksha University's Young Creators League (YCL) received 500+ video submissions evaluated by ~5 evaluators over a month. Evaluators manually downloaded videos, tracked scores on spreadsheets, and had no tooling to scale. Common failure modes:

- Poor audio/video quality → wasted evaluator time
- Bias (urban vs rural ideas, over-polished scripted answers)
- No consistency across evaluators
- Fragmented data and manual assignment overhead

---

## Core Philosophy

1. **Explainability-first** — Every AI score is grounded with exact timestamp + transcript snippet evidence
2. **Human-in-the-loop** — AI does the first pass; humans finalize every decision
3. **Rubric-driven** — All evaluations are structured around admin-configured criteria
4. **Multi-tenant, scalable** — Supports many organizations, projects, evaluators
5. **Trust through grounding** — No black-box decisions

---

## Key Features

### AI-Powered Evaluation
- Multimodal LLM processes video + transcript + submission metadata
- Outputs criterion-wise scores, timestamp-grounded justifications, flags (audio quality, compliance), overall score
- AI assigns confidence scores based on input quality and signal consistency

### Semantic Segmentation & Key Moments
- AI detects meaningful video segments (not fixed time chunks)
- Enables timeline insights, key strengths/weaknesses, clickable exploration

### Explainability Engine
- Every AI claim tied to a timestamp and transcript snippet
- Auditable, transparent, and contestable evaluations

### AI Chat Assistant (Evaluator Tool)
- Evaluators can query: "Why low score?", "Summarize video", "What are weaknesses?"
- All responses grounded with timestamps; constrained to reduce hallucination

### Human-in-the-Loop Review
- AI = first-pass evaluator
- Human reviews, adjusts scores, and finalizes the decision
- What used to take 20 minutes now takes 3 minutes

### AI vs Human Calibration
- Per-video: AI score vs human final score
- Organization-level analytics: deviation trends, rubric disagreement, evaluator consistency

### Smart Video Processing
- Audio-first pipeline: extract audio → transcribe → analyze
- Smart frame sampling: only analyze key visual moments
- Balances cost vs accuracy

### Language Handling
- Admin-defined allowed languages (e.g., English, Hindi)
- Flags unsupported/non-compliant languages
- Code-mixed content support (future)

---

## User Roles

| Role | Description |
|------|-------------|
| **Submitter** | Submits video + form; tracks application status; generates evaluation draft |
| **Evaluator (Org-bound)** | Internal evaluator assigned by admin; reviews AI-assisted evaluations, uses AI Chat, accesses timeline |
| **Evaluator (Open/External)** | Part of the evaluator marketplace; rated and verified across projects |
| **Admin** | Creates projects, defines rubrics, configures forms, assigns evaluators, views analytics |
| **Superadmin** | One per organization; manages org-level settings and all admins |

---

## Workflow

```
1. Admin creates project → defines rubric + form
2. Admin generates shareable form link → sends to submitters
3. Submitter fills form + uploads video
4. AI processes submission (transcription, segmentation, scoring)
5. Evaluator reviews AI-assisted evaluation, uses chat, finalizes scores
6. Admin views real-time analytics + AI vs human comparison
```

---

## Business Model *(tentative)*

- **Free Tier** — Up to 100-150 videos, manual tools + AI trial on 2-3 videos
- **Pro Tier** — Expanded upload quota, AI ratings on all videos, in-depth analytics
- **Enterprise Tier** — Custom AI (models trained on company hiring data), API integrations into HR systems

---

## Market

- University admissions
- Global fellowship programs (e.g., YCL, Rhodes, Fullbright)
- Corporate HR / asynchronous video interviews

---

## Tech Stack

### Frontend
- **Next.js 16.1.6** (App Router)
- **React 19.2.3**
- **TypeScript 5**
- **Tailwind CSS v4** (with `@tailwindcss/postcss`)

### Backend / API
- **Next.js API Routes** (via App Router route handlers)
- **Cloudflare Workers** (`wrangler/index.ts`) for edge deployment
- **Jose + jsonwebtoken** for JWT-based auth
- **bcryptjs** for password hashing
- **cookie / cookies** packages for session management

### Database
- **Cloudflare D1** (SQLite at the edge)
  - Binding: `DB`
  - Database name: `vidscreener`
- **Drizzle ORM** (`drizzle-orm ^0.45.1`) with `drizzle-kit ^0.31.9`

### Storage
- **Cloudflare R2** — video and file storage
  - Binding: `BUCKET`
  - Bucket name: `vidscreener`

### Infrastructure
- Deployed via **Cloudflare Workers** (`wrangler.toml`)
- Compatibility date: `2026-03-12`

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `roles` | User roles (admin, evaluator, submitter, etc.) |
| `organizations` | Multi-tenant org structure |
| `users` | All users; linked to role and org |
| `projects` | Evaluation projects owned by an org |
| `project_rubrics` | Configurable criteria with weights and sort order |
| `project_forms` | Custom submission form definition per project |
| `project_form_submissions` | Submitter responses to a form |
| `project_form_submission_attachments` | Files (videos, docs) linked to a submission; stored in R2 |
| `evaluators` | Evaluators (internal or external) linked to orgs |
| `project_evaluators` | Assignment of evaluators to projects |
| `project_videos` | Videos associated with a project |
| `project_form_shares` | Tracks who has been invited to submit to a project |
| `project_video_reviews` | Stores rubric breakdown + AI review JSON per video |

---

## Project Structure

```
vidscreener/
├── app/                        # Next.js App Router
│   ├── components/             # Reusable UI components
│   ├── dashboard/              # Admin/evaluator dashboard pages
│   ├── login/                  # Auth pages
│   ├── register/
│   ├── pitch/
│   ├── lib/
│   │   └── session.ts          # JWT session helpers
│   ├── globals.css
│   ├── layout.tsx
│   ├── middleware.ts            # Auth middleware
│   └── page.tsx
├── db/
│   ├── schema.ts               # Drizzle schema (all tables)
│   └── drizzle.ts              # DB client init
├── drizzle/                    # Migration files
├── wrangler/
│   └── index.ts                # Cloudflare Worker entry point
├── public/
├── .claude/
│   └── skills/                 # Claude Code skills library
├── package.json
├── wrangler.toml               # Cloudflare deployment config
├── drizzle.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Future Directions

- **Bias detection dashboards** — Surface demographic/idea-based scoring patterns
- **Evaluator quality scoring** — Rate external evaluators based on calibration with AI
- **Highlight reel generation** — Auto-generate clips of key submission moments
- **Advanced calibration metrics** — Per-rubric AI vs human deviation analytics
- **ATS integrations** — API endpoints for HR systems (Workday, Greenhouse, etc.)
- **Evaluator Marketplace** — Organizations hire vetted external evaluators by niche profile
- **Custom AI models** — Enterprise tier: models fine-tuned on org's historical data
- **Code-mixed language support** — Better handling of Hindi-English mixed submissions
- **Automated video flagging** — Pre-screening for audio quality, compliance, completeness

---

## Development Notes

- Run locally: `npm run dev` → starts Next.js dev server
- Database migrations: `npx drizzle-kit push` or `npx wrangler d1 migrations apply`
- Environment vars in `.dev.vars` (for local Cloudflare Workers emulation)
- Auth uses JWT stored in HTTP-only cookies
- All API routes follow Next.js App Router conventions (`app/api/.../route.ts`)
- Use Cloudflare Workers bindings (`env.DB`, `env.BUCKET`) for D1 and R2 access

---

## Brand Assets

### Logo
- **File:** `public/vidscreener.svg`
- **Usage in Next.js:** `<img src="/vidscreener.svg" />` or via `next/image`
- **Canvas:** 1024×1024, pure black background
- **Icon:** Coral-red triangular play button with white connected nodes (network graph)
- **Wordmark:** "VidScreener" in bold white geometric sans-serif

### Color Palette (extracted from SVG)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#F05438` | Brand coral-red — CTAs, accents, highlights, logo icon |
| `--color-bg` | `#000000` | Primary background (dark mode) |
| `--color-surface` | `#111111` | Cards, panels, elevated surfaces |
| `--color-text` | `#FCFCFC` | Primary text, wordmark |
| `--color-text-muted` | `#888888` | Secondary text, labels |
| `--color-border` | `#222222` | Dividers, input borders |

### CSS Variables (add to `globals.css`)

```css
:root {
  --color-primary: #F05438;
  --color-bg: #000000;
  --color-surface: #111111;
  --color-text: #FCFCFC;
  --color-text-muted: #888888;
  --color-border: #222222;
}
```

### Brand Rules
- **Current focus: dark mode only** — all UI is built dark-first for now
- Logo always on black or very dark backgrounds
- Primary buttons: `#F05438` bg, `#FCFCFC` text
- Light mode support is a future consideration, not current scope

---

## Skills Available

All 30 skills live flat in `.claude/skills/` so Claude Code can discover them automatically.

### UI/UX Design Skills — from [Impeccable](https://impeccable.so)

Give Claude the vocabulary of a designer. Use when working on frontend, layout, and visual polish:

| Skill | Purpose |
|-------|---------|
| `adapt` | Adapt UI/code for different contexts or constraints |
| `animate` | Add animations and transitions |
| `arrange` | Layout, spacing, and structural composition |
| `audit` | Design + code quality review |
| `bolder` | Make elements more visually prominent and impactful |
| `clarify` | Improve clarity, reduce cognitive load |
| `colorize` | Color palette, theming, and contrast |
| `critique` | Critical design/code review with actionable feedback |
| `delight` | Add delightful, unexpected UX moments |
| `distill` | Simplify and reduce to essentials |
| `extract` | Extract reusable components or logic |
| `frontend-design` | Frontend design patterns and component structure |
| `harden` | Improve robustness, error handling, and edge cases |
| `normalize` | Normalize inconsistent styles, data, or structure |
| `onboard` | Improve onboarding and first-run experience |
| `optimize` | Performance and rendering optimization |
| `overdrive` | Push a UI/feature into something extraordinary |
| `polish` | Final-mile UI and code polish |
| `quieter` | Reduce visual noise, simplify busy UIs |
| `teach-impeccable` | Explain and document with design vocabulary |
| `typeset` | Typography, hierarchy, and text styling |

### Cloudflare Platform Skills — from [cloudflare/skills](https://github.com/cloudflare/skills)

Encode Cloudflare-specific best practices. Highly relevant since VidScreener runs on Workers + D1 + R2:

| Skill | Purpose |
|-------|---------|
| `cloudflare` | General Cloudflare platform patterns and best practices |
| `workers-best-practices` | Workers coding conventions, bindings, and patterns |
| `wrangler` | Wrangler CLI config, deployment, and migrations |
| `durable-objects` | Building stateful services with Durable Objects |
| `agents-sdk` | Cloudflare Agents SDK for AI agent development |
| `sandbox-sdk` | Cloudflare Sandbox SDK |
| `building-ai-agent-on-cloudflare` | End-to-end AI agent architecture on Cloudflare |
| `building-mcp-server-on-cloudflare` | Building MCP servers with Cloudflare Workers |
| `web-perf` | Web performance optimization at the Cloudflare edge |
