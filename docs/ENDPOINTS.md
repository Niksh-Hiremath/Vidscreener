# VidScreener API Endpoints Report

This report categorizes all "Non-AI" and "AI" endpoints identified in the VidScreener codebase, including their current implementation status, descriptions, and evaluation benchmarks for AI-powered features.

## Non-AI Endpoints

These endpoints handle the core application logic, authentication, and data management.

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/auth/register` | POST | Implemented | Registers a new user account. |
| `/api/auth/login` | POST | Implemented | Authenticates a user and returns a JWT. |
| `/api/auth/logout` | POST | Implemented | Clears the authentication session. |
| `/api/auth/forgot-password` | POST | Implemented | Initiates the password reset flow. |
| `/api/auth/reset-password` | POST | Implemented | Resets the password using a valid token. |
| `/api/user/profile` | GET/POST | Implemented | Retrieves or updates the current user's profile. |
| `/api/user/change-password` | POST | Implemented | Updates the user's password. |
| `/api/organization/create` | POST | Implemented | Creates a new organization. |
| `/api/organization/rename` | POST | Implemented | Renames an existing organization. |
| `/api/organization/admins` | GET | Implemented | Lists all admins for the organization. |
| `/api/organization/admins/add` | POST | Implemented | Adds a new admin to the organization. |
| `/api/organization/admins/remove` | POST | Implemented | Removes an admin from the organization. |
| `/api/organization/users` | GET | Implemented | Lists all users in the organization. |
| `/api/organization/users/:id/role`| PATCH | Implemented | Updates a user's role in the organization. |
| `/api/organization/users/:id` | DELETE | Implemented | Removes a user from the organization. |
| `/api/projects` | GET | Implemented | Lists all projects for the organization. |
| `/api/projects/create` | POST | Implemented | Creates a new project. |
| `/api/projects/:id` | GET | Implemented | Retrieves detailed project information. |
| `/api/projects/:id` | PATCH | Implemented | Updates project metadata (name, status, etc). |
| `/api/projects/:id` | DELETE | Implemented | Deletes a project and all associated data. |
| `/api/projects/:id/rubrics` | GET/POST | Implemented | Retrieves or bulk-replaces project rubrics. |
| `/api/projects/:id/rubrics/:rid` | PATCH | Implemented | Updates a specific rubric. |
| `/api/projects/:id/rubrics/:rid` | DELETE | Implemented | Deletes a specific rubric. |
| `/api/projects/:id/form` | GET/POST | Implemented | Retrieves or updates the submission form definition. |
| `/api/projects/:id/form/fields` | POST | Implemented | Adds a new field to the project form. |
| `/api/projects/:id/form/fields/:i` | PATCH | Implemented | Updates a specific form field. |
| `/api/projects/:id/form/fields/:i` | DELETE | Implemented | Deletes a specific form field. |
| `/api/projects/:id/videos` | GET | Implemented | Lists all videos submitted to a project. |
| `/api/projects/:id/assign` | POST | Implemented | Assigns videos to evaluators. |
| `/api/projects/:id/unassign` | POST | Implemented | Unassigns videos from evaluators. |
| `/api/projects/:id/stream/:vid` | GET | Implemented | Streams a submitted video from R2. |
| `/api/evaluators` | GET | Implemented | Lists all available evaluators. |
| `/api/evaluator/projects` | GET | Implemented | Lists projects assigned to the current evaluator. |
| `/api/evaluator/review-queue` | GET | Implemented | Lists videos pending review for the evaluator. |
| `/api/evaluator/review-queue/:id` | GET | Implemented | Retrieves context for a specific review. |
| `/api/evaluator/review-queue/:id/review`| POST | Implemented | Saves a human-completed review. |
| `/api/submitter/applications` | GET | Implemented | Lists projects a submitter has applied to. |
| `/api/submitter/explore` | GET | Implemented | Lists open projects available for submission. |
| `/api/submitter/form/:id` | GET | Implemented | Retrieves the submission form for a project. |
| `/api/submitter/submit/:id` | POST | Implemented | Handles video upload and form submission. |
| `/api/analytics/metrics` | GET | Pending | Should return real-time project metrics (mocked in UI). |
| `/api/admin/videos` | GET | Implemented | Admin view of all organization videos. |
| `/api/projects/:id/bulk-upload` | POST | Pending | Bulk upload of submissions via ZIP file. |
| `/api/webhooks/meritto` | POST | Pending | Automated submission sync from Meritto. |

---

## AI Endpoints

The following endpoints involve AI processing. Most are currently **Pending** on the backend, with frontend mockups existing for demonstration.

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/ai/evaluate/:videoId` | POST | Pending | Triggers multimodal AI evaluation (transcription + scoring). |
| `/api/ai/chat` | POST | Pending | Handles evaluator queries about a specific video submission. |
| `/api/ai/segment` | POST | Pending | Generates semantic timeline segments for a video. |
| `/api/ai/flags` | GET | Pending | Retrieves AI-detected quality or compliance flags. |
| `/api/ai/transcribe` | POST | Pending | Extracts audio and generates a transcript with timestamps. |

---

## Evaluation Benchmarks for AI Endpoints

To maintain Quality of Service (QoS) as models evolve, the following benchmarks are defined:

### 1. Video Evaluation & Scoring (`/api/ai/evaluate`)
*   **Sample Input:** A 2-minute video submission and a project rubric (e.g., "Clarity of Thought", "Subject Expertise").
*   **Expected Output:** Score (1-5), timestamped evidence (e.g., "0:45 - mentions specific experience with Rust"), and a confidence score.
*   **LLM Judge Criteria:**
    *   **Grounding:** Are the scores directly supported by the transcript snippets?
    *   **Calibration:** Does the AI score align within ±1 point of a verified human "gold standard" score?
    *   **Relevance:** Are the justifications focused on the rubric criteria rather than superficial traits?

### 2. AI Chat Assistant (`/api/ai/chat`)
*   **Sample Input:** "Does the candidate explain their project architecture?"
*   **Expected Output:** "Yes, at 1:12 they describe the microservices layout and database choice: [Transcript snippet]."
*   **LLM Judge Criteria:**
    *   **Hallucination Check:** Does the answer cite a timestamp that exists?
    *   **Constraint Adherence:** Does the AI refuse to answer questions outside the scope of the video content?
    *   **Clarity:** Is the summary concise and accurate?

### 3. Semantic Segmentation (`/api/ai/segment`)
*   **Sample Input:** Full video file and transcript.
*   **Expected Output:** List of segments with `start`, `end`, and `label` (e.g., "Introduction", "Technical Demo", "Q&A").
*   **LLM Judge Criteria:**
    *   **Boundary Accuracy:** Do segment transitions align with natural shifts in topic or visual context?
    *   **Label Descriptive Power:** Are labels helpful for an evaluator to navigate the video quickly?

---

## Summary Counts

### Non-AI Endpoints
- **Total Identified:** 44
- **Implemented:** 41
- **Pending/In Progress:** 3 (`/api/analytics/metrics`, `/api/projects/:id/bulk-upload`, `/api/webhooks/meritto`)

### AI Endpoints
- **Total Identified:** 5
- **Implemented:** 0
- **Pending:** 5

**Note:** The platform currently provides robust infrastructure for human evaluation, but the core "AI-assisted" value proposition is currently in the **Pending** phase on the backend, despite being visually present in the dashboard UI.
