# VidScreener

VidScreener is an AI-assisted video screening platform designed to streamline admissions, hiring, and grant applications. It automates the initial review of large volumes of video submissions, scoring them based on custom rubrics and prioritizing candidate queues for human evaluators.

## Key Features
- **Effortless Submissions**: Direct-to-object-storage uploads (via MinIO) allowing applicants to submit videos without creating accounts.
- **AI-Powered Evaluation**: Automated scoring and flagging (e.g., duration limits, audio quality) against customizable organization rubrics.
- **Evaluator Dashboard**: A focused interface for human reviewers, combining the video player, AI insights, applicant info, and scoring tools.
- **Project Configuration**: Admin dashboard for creating tailored projects, managing evaluator assignments, and defining unique rubrics.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes (Server Components/Actions)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (with Role-Based Access Control)
- **Storage**: MinIO (S3-compatible Object Storage)
- **AI Integration**: Designed for multimodal LLMs (e.g., Gemini 1.5 Pro)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Postgres (Supabase CLI or hosted instance)
- MinIO (via Docker)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd vidscreener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_USE_SSL=false
   MINIO_ACCESS_KEY=your_minio_access_key
   MINIO_SECRET_KEY=your_minio_secret_key
   MINIO_BUCKET_NAME=vidscreener
   ```

4. Run the infrastructure (MinIO):
   ```bash
   docker-compose up -d
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

You can now access the application at `http://localhost:3000`.

## Architecture & Documentation
For a deeper dive into the system design, AI prompting strategies, and product vision, please refer to the `docs/` folder:
- [Product Pitch & Vision](docs/PRODUCT_PITCH.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [AI Rubric Configuration](docs/PROMPT_RUBRICS.md)

## Future Roadmap
- Integration with major Application Tracking Systems (ATS).
- Refined Bias Monitoring dashboards for admin oversight.
- Live, AI-assisted video interview modes.