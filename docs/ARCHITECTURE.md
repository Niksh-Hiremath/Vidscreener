# VidScreener Architecture

VidScreener is a modern, high-performance, and AI-assisted video evaluation platform built exclusively on the Cloudflare ecosystem for maximum edge performance and scalability.

## High-Level System Design

The system is composed of several key layers, each optimized for its specific function:

### 1. Frontend: Next.js (App Router)
- **Deployment**: Deployed on Cloudflare Pages.
- **Role**: Provides the user interface for Admins, Evaluators, and Submitters.
- **Styling**: Utilizes Tailwind CSS v4 with a unified dark-mode design system.
- **Client-Side States**: Manages complex states like the project form builder and the review timeline.

### 2. Backend & API: Cloudflare Workers
- **Entry Point**: `wrangler/index.ts`
- **Logic**: All API routes and core business logic are handled in the worker layer, ensuring ultra-low latency globally.
- **Authentication**: JWT-based session management using the `jose` library, stored in HTTP-only cookies.
- **Validation**: Strict server-side role-based access control (RBAC) enforced in middleware and at the handler level.

### 3. Data Layer: Cloudflare D1
- **Database**: A distributed SQLite database managed by Cloudflare D1.
- **ORM**: Drizzle ORM provides a type-safe interface and handles migrations (`drizzle/` directory).
- **Multi-Tenancy**: Data is logically partitioned by `organizationId`.

### 4. Storage Layer: Cloudflare R2
- **Function**: Used for high-volume, cost-effective storage of video submissions, PDF attachments, and any other project files.
- **Streaming**: Implements ranged reads for efficient video playback directly from the edge.

### 5. AI Evaluation Pipeline (Planned)
- **Transcription**: Powered by Cloudflare Workers AI (Whisper) or external high-performance APIs.
- **Analysis**: Multimodal Large Language Models (LLMs) process the video and transcript against admin-defined rubrics.
- **Grounding**: The AI generates scores alongside exact timestamped evidence, ensuring transparent and explainable assessments.
- **Chat**: A dedicated AI assistant allows evaluators to query video content in real-time.

---

## Data Flow & Lifecycle

1. **Submission**: A Submitter fills out a project-specific form and uploads a video via the R2-backed API.
2. **Ingestion**: The submission is recorded in D1, and the video is stored in R2.
3. **Processing**: (Planned) An AI pipeline extracts audio, transcribes it, and evaluates the content against the project's rubrics.
4. **Human Review**: An assigned Evaluator accesses the review dashboard, views the AI's preliminary scores and evidence, and finalizes the assessment.
5. **Analytics**: Admins view aggregated metrics and compare AI vs. Human scores to ensure calibration and reduce bias.

## Technical Standards & Security

- **Edge First**: All logic runs at the network edge, minimizing cold starts and latency.
- **Security**: JWT secrets are managed via environment variables; all destructive actions require explicit permission and role verification.
- **Scalability**: The serverless architecture allows the platform to scale from a single project to thousands of submissions without infrastructure overhead.
