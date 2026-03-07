# VidScreener User Journeys

The VidScreener platform is designed around three distinct user personas: Applicants, Evaluators, and Administrators. This document covers the core journeys for each persona.

## 1. The Applicant Journey

**Goal**: Submit a video application with minimal friction.

1. **Accessing the Portal**: 
   - The applicant navigates to `/submit` directly or clicks a link provided by the institution (e.g., `/submit/form-uuid-1234`).
2. **Reviewing the Prompt**: 
   - The applicant reads the project guidelines, evaluation criteria, and maximum video duration rules.
3. **Data Entry**: 
   - The applicant fills out basic identifiable information (Name, Email).
4. **Video Upload**: 
   - The applicant selects a pre-recorded video file from their device.
   - The browser securely requests a presigned PUT URL directly from `/api/videos/upload-url`.
   - The video is uploaded directly to MinIO, keeping the application frontend highly performant.
5. **Submission Confirmation**: 
   - Upon successful upload, a final API call links the video to the applicant's submission record in Postgres.
   - The applicant receives a tracking ID and views the success page (`/submit/:formId/success`).
6. **Status Checking**: 
   - The applicant can later return to `/submit/status/:submissionId` to track whether their video is processing, under review, or graded.

## 2. The Evaluator Journey

**Goal**: Confidently review and grade an AI-pre-screened applicant pipeline.

1. **Secure Login**: 
   - The evaluator navigates to `/evaluator/login` and authenticates via Supabase Auth.
2. **Dashboard Overview**: 
   - The evaluator lands on `/evaluator/dashboard` and views a high-level summary of their pending tasks. They can quickly see how many videos are awaiting review and how many were flagged by AI as Urgent or Non-Compliant.
3. **The Review Queue**: 
   - Moving to `/evaluator/queue`, the evaluator sees a prioritized list of their assignments. AI confidence scores dictate the sorting order, allowing the human to focus on borderline cases first.
4. **The Review Interface**: 
   - The evaluator selects an assignment and enters the review workspace (`/evaluator/review/:videoId`).
   - The applicant's video plays directly in the browser (via MinIO presigned GET URLs).
   - The right-hand panel displays the AI-generated evaluation (Overall Score, Criteria Breakdown, Justifications).
   - If the evaluator agrees with the AI, they click "Approve AI." If they disagree, they use the interface to adjust scores and submit a final human "Override" to `/api/evaluations`.
5. **Chat Assistant**: 
   - During playback, if the evaluator is confused by a specific AI score, they can toggle the "Chat" tab to interrogate the LLM regarding its specific evaluation rationale.

## 3. The Administrator Journey

**Goal**: Manage evaluation projects, define AI rubrics, and oversee team performance.

1. **Secure Login**: 
   - The admin accesses `/admin/login` and is authenticated, inheriting elevated privileges via Supabase RBAC.
2. **System Analytics**: 
   - The admin lands on `/admin/dashboard`, viewing aggregated platform metrics (Total Videos Processed, Average Processing Time, Top Contributing Evaluators).
3. **Project Management**: 
   - In `/admin/projects`, the admin creates a new admissions cycle (e.g., "MBA Class of 2026").
   - The admin defines the application deadline, the prompt for the applicants, and the exact constraints (e.g., "Max Video Duration: 3 min").
4. **Rubric Definition**: 
   - For the new project, the admin constructs the JSON rubric that the AI will use to judge the videos (e.g., "50% Content, 25% Presentation, 25% Creativity").
5. **Team Management**: 
   - In `/admin/evaluators`, the admin invites new faculty or staff members to the platform.
   - The admin monitors the workload and can manually (or automatically) reassign large batches of pending videos from one evaluator's queue to another's.
6. **Quality Assurance**: 
   - Admins use `/admin/videos` to view a master ledger of all submissions, keeping tabs on how often human evaluators are overriding the AI.
