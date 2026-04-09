# VidScreener User Journeys

This document outlines the primary workflows for the different user roles in VidScreener.

## 1. The Admin Journey: Project Setup & Oversight

**Objective**: Create, configure, and manage high-scale evaluation programs.

1. **Organization Setup**:
   - The Admin registers and creates their Organization profile.
   - They invite other team members (Admins or Evaluators).

2. **Project Creation**:
   - The Admin creates a new Project (e.g., "YCL Admissions 2026").
   - **Rubric Configuration**: They define scoring criteria with descriptions and weights.
   - **Form Building**: They design a custom submission form (Text fields, Checkboxes, File uploads).

3. **Distribution**:
   - The Admin generates a public submission link or invites specific individuals via email.
   - (Bulk Method): They upload a ZIP archive of historical submissions for migration.
   - (Meritto Method): They connect a Meritto webhook for automated ingest.

4. **Resource Management**:
   - They monitor incoming submissions in real-time.
   - They assign videos to specific Evaluators manually or using automated distribution logic.
   - They track overall progress and analytics.

---

## 2. The Submitter Journey: Application & Upload

**Objective**: Seamlessly submit video and data for evaluation.

1. **Discovery**:
   - The Submitter receives an invitation email or accesses a public project link.

2. **Submission**:
   - They fill out the project-specific form fields.
   - They upload their video file (and any required PDFs).
   - They receive a confirmation that their application has been received.

3. **Post-Submission**:
   - (Planned): They can track their application status through their dashboard.

---

## 3. The Evaluator Journey: Review & Finalization

**Objective**: Efficiently review submissions assisted by AI insights.

1. **Queue Access**:
   - The Evaluator logs in and views their assigned "Review Queue."
   - They see basic project context and submission metadata.

2. **Review Execution**:
   - They open a specific submission.
   - **Video Playback**: They watch the submission using the integrated player.
   - **AI Assistance**: (Planned) They view AI-generated scores and exact timestamped evidence (segments/transcripts).
   - **Interactive Chat**: (Planned) They query the AI assistant for specific details ("Did they mention Rust?").

3. **Final Scoring**:
   - The Evaluator adjusts the rubric scores based on their judgment.
   - They add qualitative feedback and "finalize" the review.

---

## 4. The Analytics & Calibration Cycle (Admin)

1. **Outcome Analysis**:
   - The Admin views the Analytics dashboard.
   - They compare **AI Scores vs. Human Scores** to identify model drift or evaluator bias.
   - They export the final results for their admissions or hiring board.
