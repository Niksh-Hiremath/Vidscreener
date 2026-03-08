# VidScreener API Endpoints

VidScreener utilizes **Next.js API Routes** to interface between the frontend and the data/storage layers (Supabase & MinIO). All internal API calls are authenticated using a secure cookie-based session token (`sb-access-token`).

## Authentication (`/api/auth/*`)

### `POST /api/auth/signup`
- **Description**: Registers a new user. 
- **Behavior**: If `organization_name` is provided, a new Org is created. If `org_secret_key` is provided, the user is joined to an existing Org.
- **Body**: `{ "email": "...", "password": "...", "full_name": "...", "role": "...", "organization_name"?: "...", "org_secret_key"?: "..." }`

### `POST /api/auth/login`
- **Description**: Authenticates a user and sets an `sb-access-token` cookie.
- **Response**: `{ "user": { ... }, "session": { ... } }`

### `GET /api/auth/me`
- **Description**: Returns the profile and organizational context for the logged-in user.
- **Response**: `{ "user": { "id": "...", "role": "admin", "organization": { "id": "...", "name": "...", "org_secret_key": "..." } } }`

---

## Submitter Portal (`/api/forms/*` and `/api/submissions/*`)

### `GET /api/forms/[id]`
- **Description**: Fetches form configuration (labels, required fields).
- **Notes**: Supports `demo-*` IDs for walkthroughs without DB overhead.

### `POST /api/forms/[id]/submit`
- **Description**: Records form field responses and creates the parent submission record.
- **Body**: `{ "submitter_name": "...", "submitter_email": "...", "responses": [ { "field_id": "...", "response_text": "..." } ] }`

---

## Video & Storage (`/api/videos/*`)

### `POST /api/videos/upload-url`
- **Description**: Generates a MinIO presigned PUT URL for direct-to-storage upload.
- **Body**: `{ "organization_id": "...", "project_id": "...", "filename": "video.mp4" }`
- **Response**: `{ "uploadUrl": "...", "minio_object_key": "..." }`

### `GET /api/videos/[id]/playback-url`
- **Description**: Generates a short-lived presigned GET URL for secure video streaming.

---

## Evaluator Queue (`/api/evaluators/me/assignments`)

### `GET /api/evaluators/me/assignments`
- **Description**: Lists pending and completed video assignments for the current evaluator.
- **Response**: `{ "assignments": [ { "id": "...", "status": "pending", "videos": { ... }, "projects": { ... } } ] }`

---

## Admin Management (`/api/projects/*`, `/api/evaluators/*`, `/api/analytics/*`)

### `GET /api/analytics`
- **Description**: Aggregates dashboard metrics (Total Submissions, Video Status Breakdown, Avg Review Time).
- **Scope**: Filtered by the admin's `organization_id`.

### `GET /api/evaluators`
- **Description**: Lists all evaluators in the organization with their performance stats (Count of assignments, avg review speed).

### `POST /api/evaluators/[id]/assignments`
- **Description**: Batch-assigns videos to a specific evaluator.
- **Body**: `{ "video_ids": ["..."], "project_id": "...", "due_date": "..." }`
