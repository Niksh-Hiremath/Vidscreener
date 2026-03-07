# VidScreener: AI-Assisted Video Screening Platform

## The Problem
Organizations face overwhelming volumes of video applications for admissions, hiring, and grants. Human review is slow, expensive, and subject to fatigue and bias. Current tools lack intelligent automation, making it difficult to efficiently surface the best candidates from a large pool of video submissions.

## The Solution: VidScreener
VidScreener is a modern, end-to-end video screening platform that combines the scale of AI with the nuance of human judgment. By using AI to pre-evaluate, flag, and score videos based on custom rubrics, VidScreener dramatically reduces manual review time while improving evaluation consistency.

### Key Value Propositions
1. **10x Faster Screening**: AI handles the initial pass, scoring candidates on predefined criteria (e.g., communication, relevance) and flagging issues (e.g., over time limit, poor audio).
2. **Customizable Workflows**: Admins can define dynamic rubrics per project, ensuring the AI and human evaluators judge candidates exactly according to the organization's needs.
3. **Frictionless Submission**: Candidates upload videos directly through a fast, branded portal without needing to create accounts.
4. **Intelligent Review Queue**: Human evaluators don't start from scratch. They review the AI's detailed breakdown, chat with the AI for context, and can either approve the AI's score or override it with their own expertise.

## Target Audience
- **University Admissions**: Processing thousands of video essays for competitive programs.
- **Corporate Recruiting**: Conducting initial behavioral screens at scale.
- **Grant Foundations**: Reviewing video pitches for funding applications.

## Core Features
### For Admins
- **Interactive Dashboard**: Real-time analytics on submission volume, AI processing status, and evaluator performance.
- **Project & Form Builder**: Create distinct projects (e.g., "Spring 2026 Admissions") and configure the submission forms and video requirements.
- **Rubric Configuration**: Define exactly what the AI should look for (e.g., 30 points for Communication, 20 points for Content).
- **Evaluator Management**: Invite team members and intelligently route assignments based on workload or expertise.

### For Evaluators
- **Prioritized Queue**: A smart inbox of assignments, highlighting candidates flagged by AI.
- **AI-Assisted Review Interface**: A unified view featuring the video player, the applicant's info, and the AI's complete breakdown (scores and justifications).
- **AI Chat Assistant**: Ask specific questions about a candidate's submission directly to the AI agent.

### For Applicants
- **Simple Portal**: Enter a unique form ID and immediately record or upload a video.
- **Direct-to-Storage Uploads**: Fast, secure uploads directly to object storage via presigned URLs.
- **Real-time Status tracking**: Check the application status at any time.

## Technology Stack Highlight
VidScreener is built for scale, performance, and AI readiness from day one:
- **Next.js 14 & React**: App Router, Server Components, and sleek Tailwind CSS interfaces.
- **Supabase (PostgreSQL)**: Robust relational data with Row Level Security (RLS) for secure multi-tenant architecture.
- **MinIO Object Storage**: S3-compatible, high-performance video storage.

## Future Vision (v2 & Beyond)
- **Live Interview Mode**: Expand from asynchronous video screening to live, AI-assisted candidate interviews.
- **Bias Detection**: Advanced AI monitoring to ensure scoring rubrics aren't disproportionately affecting certain demographic groups.
- **Integrations**: Seamlessly sync candidate statuses with major ATS and CRM platforms (Greenhouse, Workday, Slate).
