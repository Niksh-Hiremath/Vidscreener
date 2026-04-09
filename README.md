# VidScreener — AI-Assisted Video Evaluation

VidScreener is a high-performance, edge-native platform that transforms unstructured video submissions into structured, explainable, and scalable assessments. It combines multimodal AI with human expert review to streamline high-volume screening for admissions, hiring, and fellowship programs.

---

## 🚀 The Core Proposition

- **Explainability-first**: Every AI-generated score is grounded with exact timestamped evidence and transcript snippets.
- **Human-in-the-Loop**: AI handles the first-pass evaluation, while humans maintain final decision-making power.
- **Edge-Native Performance**: Built entirely on the Cloudflare ecosystem (Workers, D1, R2) for global low-latency.
- **Scalable Workflows**: Supports manual uploads, bulk ZIP imports, and real-time Meritto webhook integration.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16.1.6 (App Router), React 19, Tailwind CSS v4.
- **Backend**: Cloudflare Workers (TypeScript).
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM.
- **Storage**: Cloudflare R2 for video and document storage.
- **Authentication**: JWT-based session management.
- **AI Infrastructure**: Cloudflare Workers AI & Multimodal LLM integration (Planned).

---

## 📚 Documentation

Detailed information can be found in the `docs/` directory:

- [**Product Pitch**](./docs/PRODUCT_PITCH.md): Understanding the "Why" behind VidScreener.
- [**Architecture**](./docs/ARCHITECTURE.md): Deep dive into the system design and data flow.
- [**Database Schema**](./docs/DATABASE_SCHEMA.md): Detailed table definitions and relationships.
- [**User Journeys**](./docs/USER_JOURNEYS.md): Workflows for Admins, Evaluators, and Submitters.
- [**API Endpoints**](./docs/ENDPOINTS.md): Comprehensive report of all AI and Non-AI routes.
- [**Codebase Audit**](./docs/AUDIT.md): Current status and feature roadmap.

---

## 💻 Local Development

### 1. Prerequisites
- Node.js (v20+)
- Cloudflare Wrangler CLI

### 2. Setup
```bash
# Install dependencies
npm install
```

### 3. Run the Servers
In separate terminal windows:
```bash
# Start Next.js frontend
npm run dev

# Start Cloudflare Worker backend
npx wrangler dev
```
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:8787`

### 4. Database Migrations
VidScreener uses Drizzle ORM for schema management.
```bash
# Generate a new migration after schema changes
npx drizzle-kit generate

# Apply migrations to the D1 instance
npx wrangler d1 migrations apply vidscreener --local
npx wrangler d1 migrations apply vidscreener --remote
```

---

## ⚖️ License & Contributions
This project is currently in active development. Please refer to `docs/AUDIT.md` for the current implementation status and the roadmap ahead.
