# VidScreener System Architecture

VidScreener is an AI-assisted video screening platform built with a modern, scalable, and multi-tenant ready architecture.

## Component Overview

### 1. Frontend (Next.js 16)
The application is built using **Next.js 16** with the **App Router** and **React Server Components (RSC)**.
- **Applicant Portal (`/submit`)**: Features a **Discovery Landing** with glassmorphic cards for available opportunities. It includes an intelligent **Demo Mode** for walkthroughs and a direct form entry system.
- **Admin Portal (`/admin`)**: A multi-page management suite for organizations to control projects, rubrics, and team assignments. It utilizes a secure `org_secret_key` sharing model for onboarding.
- **Evaluator Portal (`/evaluator`)**: A task-oriented dashboard for reviewing assigned videos, featuring AI-assisted scoring and a focus on reducing manual cognitive load.

### 2. Authentication & RBAC
- **Supabase Auth**: Managed JWT-based authentication.
- **Custom RBAC**: User roles (`admin`, `evaluator`, `submitter`) are verified through a custom `useAuth` hook and enforced on the server via session cookies.
- **Organization Isolation**: Every record is linked to an `organization_id`, ensuring strict data boundaries between different customers.

### 3. RELATIONAL LAYER (Supabase + Postgres)
- **Schema Management**: Managed via Supabase migrations.
- **Service Client Pattern**: Critical API routes use a `serviceClient` with the bypass key to handle complex cross-table joins (e.g., embedding evaluator counts while filtering by organization) that exceed standard client-side RLS limitations.
- **Key Entities**: `organizations`, `users`, `projects`, `rubrics`, `submission_forms`, `videos`, `evaluator_assignments`, `ai_evaluations`, `human_evaluations`.

### 4. Media & Storage (MinIO)
- **Direct-to-S3 Uploads**: Applicants upload massive video files directly to MinIO using presigned PUT URLs, bypassing the Next.js execution environment for peak performance.
- **Secure Streaming**: Evaluators stream videos through temporary presigned GET URLs, ensuring no media is ever publicly exposed.

### 5. Deployment & Infrastructure
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Object Storage**: MinIO
- **AI Integration**: Multimodal LLMs (integrated via background processing to populate `ai_evaluations`).
