# VidScreener: AI-Assisted Video Screening Platform

## The Problem
Organizations face overwhelming volumes of video applications for admissions, hiring, and grants. Human review is slow, expensive, and subject to fatigue and bias. Current tools lack intelligent automation, making it difficult to efficiently surface the best candidates from a large pool of video submissions.

## The Solution: VidScreener
VidScreener is a modern, end-to-end video screening platform that combines the scale of AI with the nuance of human judgment. By using AI to pre-evaluate, flag, and score videos based on custom rubrics, VidScreener dramatically reduces manual review time while improving evaluation consistency.

### Key Value Propositions
1. **10x Faster Screening**: AI handles the initial pass, scoring candidates on predefined criteria (e.g., communication, relevance) and flagging issues (e.g., over time limit, poor audio).
2. **Customizable Workflows**: Admins can define dynamic rubrics per project, ensuring the AI and human evaluators judge candidates exactly according to the organization's needs.
3. **Frictionless Submission**: Candidates upload videos directly through a fast, branded portal. Submitter dashboards allow users to track multiple applications in one place.
4. **Intelligent Review Queue**: Human evaluators don't start from scratch. They review the AI's detailed breakdown and can either approve the AI's score or override it with their own expertise.

## Core Features

### For Admins
- **Interactive Dashboard**: Real-time analytics on submission volume, AI processing status, and evaluator performance.
- **Form Builder**: Create distinct projects and configure custom form fields (text, select, etc.) for deeper candidate insights.
- **Rubric Configuration**: Define multi-criterion rubrics with individual weights and max points.
- **Organizational Secret Keys**: Securely onboard team members without exposing public registration links.

### For Evaluators
- **Personalized Queue**: A focused dashboard showing pending assignments and urgent review flags.
- **AI-Assisted Review Interface**: A unified view featuring the dual-video player, criteria breakdown, and real-time score adjustment.
- **Performance Analytics**: Insight into personal review speed and scoring consistency.

### For Applicants/Submitters
- **Discovery Portal**: Browse available opportunities with a stunning card-based UI.
- **Submission History**: A persistent dashboard to track the status of multiple video applications.
- **Direct-to-Storage Uploads**: Optimized for performance with large video files.

## Technology Stack Highlight
VidScreener is built for scale, performance, and AI readiness:
- **Next.js 16 & React**: App Router, Server Components, and premium Tailwind CSS interfaces.
- **Supabase (PostgreSQL)**: Multi-tenant relational data with secure authentication.
- **MinIO Object Storage**: High-performance, S3-compatible storage for massive video volumes.
- **Multimodal AI**: Leverages state-of-the-art LLMs for deep video understanding and evaluation.
