# VidScreener API Endpoints

VidScreener uses Next.js API routes (`app/api/*`) to handle backend functionality, providing a boundary between the frontend UI and the Supabase/MinIO infrastructure. Most routes are protected by Supabase Auth and enforce Role-Based Access Control (RBAC).

## Authentication (`/api/auth/*`)

### `POST /api/auth/signup`
- **Description**: Registers a new user. Usually restricted to Admin invites in production.
- **Body**: `{ "email": "user@example.com", "password": "securepassword", "role": "evaluator" }`
- **Response**: `{ "user": { ... }, "session": { ... } }`

### `POST /api/auth/login`
- **Description**: Authenticates a user and establishes a secure session cookie.
- **Body**: `{ "email": "user@example.com", "password": "securepassword" }`
- **Response**: `{ "user": { ... }, "session": { ... } }`

### `POST /api/auth/logout`
- **Description**: Invalidates the current user session and clears cookies.
- **Response**: `{ "success": true }`

---

## Applicant Submission (`/api/videos/*` and `/api/forms/*`)

### `GET /api/forms/[id]`
- **Description**: Unauthenticated route. Fetches the configuration for a specific submission form.
- **Response**: `{ "id": "...", "title": "...", "prompt": "...", "project_name": "..." }`

### `POST /api/videos/upload-url`
- **Description**: Generates a short-lived MinIO presigned PUT URL. Used actively by the applicant recording portal.
- **Body**: `{ "fileName": "video.mp4", "fileType": "video/mp4" }`
- **Response**: `{ "uploadUrl": "https://...", "objectName": "..." }`

### `POST /api/forms/[id]/submit`
- **Description**: Finalizes the application by creating a `submissions` record and a linked `videos` record pointing to the newly uploaded MinIO object.
- **Body**: `{ "applicantInfo": { ... }, "videoMetadata": { "objectName": "...", "duration": 120 } }`
- **Response**: `{ "success": true, "submissionId": "..." }`

---

## Evaluator Endpoints (`/api/evaluators/*` and `/api/evaluations/*`)

### `GET /api/evaluators/me/assignments`
- **Description**: Fetches the queue of assigned videos for the currently authenticated Evaluator.
- **Response**: `{ "assignments": [ { "id": "...", "video_id": "...", "status": "pending", "videos": { "original_filename": "..." } } ] }`

### `GET /api/videos/[id]/play-url`
- **Description**: Generates a MinIO presigned GET URL for streaming the video securely in the Review Interface.
- **Response**: `{ "url": "https://..." }`

### `POST /api/evaluations`
- **Description**: Submits the final human review (scores, justifications, flags) for a graded video. Marks the assignment as complete.
- **Body**: `{ "assignment_id": "...", "video_id": "...", "scores": { "overall": 85 }, "notes": "Strong candidate." }`
- **Response**: `{ "success": true, "evaluation_id": "..." }`

---

## Administrator Endpoints (`/api/projects/*` and `/api/analytics/*`)

### `GET /api/analytics`
- **Description**: Aggregates high-level metrics across all tables for the Admin Dashboard.
- **Response**: `{ "totalSubmissions": 1420, "pendingReviews": 350, "averageAiScore": 76.5 }`

### `GET /api/projects`
- **Description**: Lists all evaluation campaigns and their respective configurations.
- **Response**: `[ { "id": "...", "name": "MBA 2026", "rubric_json": { ... } } ]`

### `GET /api/evaluators`
- **Description**: Lists all active team members with the 'evaluator' or 'admin' role. Supports POST for sending invites.
- **Response**: `[ { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "evaluator" } ]`
