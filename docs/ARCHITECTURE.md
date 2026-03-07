# VidScreener System Architecture

This document describes the high-level system architecture of VidScreener, an AI-assisted video screening platform.

## High-Level Diagram

```mermaid
graph TD
    classDef frontend fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:white
    classDef backend fill:#10b981,stroke:#047857,stroke-width:2px,color:white
    classDef storage fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:white
    classDef external fill:#8b5cf6,stroke:#5b21b6,stroke-width:2px,color:white

    subgraph "Frontend Applications (Next.js)"
        AP[Applicant Portal]:::frontend
        AD[Admin Dashboard]:::frontend
        EV[Evaluator Dashboard]:::frontend
    end

    subgraph "API Layer (Next.js Server Actions / API Routes)"
        API_A[Auth API]:::backend
        API_F[Forms API]:::backend
        API_V[Videos API]:::backend
        API_E[Evaluations API]:::backend
    end

    subgraph "Data Storage"
        DB[(Supabase PostgreSQL)]:::storage
        S3[(MinIO Object Storage)]:::storage
    end

    subgraph "AI Processing"
        LLM[Google Gemini 1.5 Pro / LLM]:::external
        WORKER[Background Workers / Edge Functions]:::backend
    end

    %% Frontend to API
    AP -->|Submits Form & Request URL| API_F
    AP -->|Requests Upload URL| API_V
    AD -->|Manages Projects, Roles| API_A
    AD -->|Views Analytics| API_E
    EV -->|Fetches Queue| API_E
    EV -->|Submits Final Review| API_E

    %% API to Storage
    API_A <-->|User Management| DB
    API_F <-->|Form Config & Metadata| DB
    API_V <-->|Video Metadata & Presigned URLs| DB
    API_V -->|Generates Presigned URLs| S3
    API_E <-->|Scores & Notes| DB

    %% Direct to Storage
    AP -->|Direct Upload (Presigned PUT)| S3
    EV -->|Direct Stream (Presigned GET)| S3

    %% AI Pipeline
    S3 -.->|Webhook/Event| WORKER
    WORKER -->|Fetches Video| S3
    WORKER -->|Fetches Rubric| DB
    WORKER -->|Sends Video & Prompt| LLM
    LLM -->|Returns JSON Score| WORKER
    WORKER -->|Saves AI Evaluation| DB
```

## Component Overview

### 1. Frontend (Next.js)
VidScreener is built with Next.js 14 utilizing the App Router. The frontend is split into three main portals:
- **Applicant Portal (`/submit`)**: An unauthenticated, streamlined flow for candidates to enter a form ID, read the prompt, and upload their video. It is built to minimize friction and bounce rates.
- **Admin Portal (`/admin`)**: A comprehensive dashboard for creating projects, assigning evaluators, viewing analytics, and defining AI rubrics.
- **Evaluator Portal (`/evaluator`)**: A focused workspace containing a review queue, video player with dual-pane AI insights, and human-in-the-loop scoring capabilities.

### 2. Authentication & Authorization (Supabase Auth)
Supabase handles user authentication (JWT) and session management. 
- Role-based access control (RBAC) is implemented via middleware (`middleware.ts`) and within the API routes to ensure:
  - Unauthenticated users can only access the `submit` route.
  - Users with the `evaluator` role can access the queue and evaluation routes.
  - Users with the `admin` role have access to all system configurations and dashboards.

### 3. API Layer (Next.js API Routes)
The backend logic is implemented as stateless Next.js API Routes (`/api/*`), functioning as a Bff (Backend-for-Frontend). Key endpoints include:
- `/api/videos/upload-url`: Securely generates short-lived MinIO presigned PUT URLs, keeping heavy video payloads off the Next.js server.
- `/api/evaluations`: Handles the retrieval of assignments and the submission of finalized human reviews.
- `/api/admin/projects`: Manages the lifecycle and configuration of application pools and rubrics.

### 4. Relational Database (Supabase PostgreSQL)
Supabase Provides the core relational datastore. The schema utilizes Row Level Security (RLS) policies (enforced on the client-side/edge, or bypassed securely via the Service Role key in API handlers). Key tables include:
- `projects`: Represents an application campaign (e.g., "MBA 2026").
- `forms`: The configuration data rendering the applicant-facing portal.
- `videos`: Metadata linking a file in MinIO to its applicant.
- `evaluator_assignments`: Tracks which human is assigned to which video.
- `evaluations`: Stores both the AI-generated JSON evaluation and the final Human override.

### 5. Media Storage (MinIO)
To ensure the platform can handle gigabytes of video data cost-effectively (and deployably on-premise if needed), MinIO is used as an S3-compatible object store.
- Validated uploads go directly from the Applicant's browser to MinIO using a Presigned PUT URL.
- Video playback directly streams from MinIO to the Evaluator's browser using a Presigned GET URL.

### 6. AI Evaluation Pipeline (Background processing)
While this is a modular component, the typical flow involves:
1. A video upload completes in MinIO.
2. An event triggers a background worker (or Supabase Edge Function).
3. The worker queries the database for the necessary Rubric string, associated with the video's project.
4. The worker constructs a prompt (including the video data) and queries a multimodal LLM (e.g., Gemini 1.5 Pro).
5. The LLM returns a structured JSON response of scores and flags.
6. The worker parses the JSON and inserts the `ai_evaluation` record into Supabase, transitioning the video status to `pending_human_review`.
