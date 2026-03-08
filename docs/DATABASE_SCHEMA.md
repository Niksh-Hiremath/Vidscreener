# VidScreener Database Schema

VidScreener utilizes **Supabase (PostgreSQL)** as its primary relational store. The schema is optimized for multi-tenant isolation and granular tracking of both AI-generated and human-submitted evaluations.

## Core Tables

### `organizations`
Represents the top-level tenant (e.g., a university or company).
- `id`: (uuid, PK)
- `name`: (text) The display name of the org.
- `slug`: (text, unique) URL-friendly identifier.
- `org_secret_key`: (text, unique) A secret key shared with members for role-based signup.
- `created_at`: (timestamptz)

### `users`
Profiles for authenticated users (Admin, Evaluator, Submitter). Use `auth.users` for credentials.
- `id`: (uuid, PK, references auth.users)
- `organization_id`: (uuid, FK) Null for global admins if applicable.
- `full_name`: (text)
- `email`: (text)
- `role`: (enum) `admin`, `evaluator`, `submitter`.
- `avatar_url`: (text)
- `created_at`: (timestamptz)

### `projects`
Workspaces for specific evaluation campaigns.
- `id`: (uuid, PK)
- `organization_id`: (uuid, FK)
- `name`: (text) e.g., "MBA Admissions 2024".
- `description`: (text) Instructions for applicants and context for AI.
- `status`: (text) `draft`, `active`, `archived`.
- `created_by`: (uuid, FK references users)
- `created_at`: (timestamptz)

### `rubrics`
Configuration for scoring systems.
- `id`: (uuid, PK)
- `project_id`: (uuid, FK + unique) One rubric per project.
- `name`: (text)
- `description`: (text)
- `created_at`: (timestamptz)

### `rubric_criteria`
Individual scoring metrics within a rubric.
- `id`: (uuid, PK)
- `rubric_id`: (uuid, FK)
- `name`: (text) e.g., "Communication Quality".
- `description`: (text) Specific guidance for the evaluator.
- `max_points`: (int)
- `weight`: (float) Importance multiplier.
- `order_index`: (int)

### `submission_forms`
The configuration for the applicant interface.
- `id`: (uuid, PK)
- `project_id`: (uuid, FK)
- `title`: (text)
- `instructions`: (text)
- `requires_video`: (boolean)
- `requires_documents`: (boolean)
- `is_active`: (boolean)
- `created_at`: (timestamptz)

### `form_fields`
Custom fields for binary/text data on application forms.
- `id`: (uuid, PK)
- `form_id`: (uuid, FK)
- `label`: (text) e.g., "Years of Experience".
- `field_type`: (text) `text`, `textarea`, `select`, `number`.
- `options`: (jsonb) For select fields.
- `is_required`: (boolean)
- `order_index`: (int)

### `submissions`
The parent record for a candidate's application.
- `id`: (uuid, PK)
- `form_id`: (uuid, FK)
- `project_id`: (uuid, FK)
- `submitted_by`: (uuid, FK references users)
- `submitted_at`: (timestamptz)

### `submission_responses`
Values submitted for custom form fields.
- `id`: (uuid, PK)
- `submission_id`: (uuid, FK)
- `field_id`: (uuid, FK)
- `response_text`: (text)

### `videos`
Metadata for the video stored in MinIO.
- `id`: (uuid, PK)
- `project_id`: (uuid, FK)
- `submission_id`: (uuid, FK)
- `minio_object_key`: (text) The unique S3 path.
- `original_filename`: (text)
- `mime_type`: (text)
- `size_bytes`: (bigint)
- `status`: (text) `pending`, `uploaded`, `ready`, `processing`.
- `processed_at`: (timestamptz)
- `created_at`: (timestamptz)

### `evaluator_assignments`
Queue mapping for human review.
- `id`: (uuid, PK)
- `video_id`: (uuid, FK)
- `evaluator_id`: (uuid, FK references users)
- `project_id`: (uuid, FK)
- `assigned_by`: (uuid, FK references users)
- `status`: (text) `pending`, `in_progress`, `completed`.
- `due_date`: (timestamptz)
- `assigned_at`: (timestamptz)

### `ai_evaluations`
Direct output from the multimodal AI processing.
- `id`: (uuid, PK)
- `video_id`: (uuid, FK)
- `model_name`: (text)
- `overall_score`: (float)
- `summary`: (text)
- `raw_response`: (jsonb) The full LLM JSON.
- `created_at`: (timestamptz)

### `human_evaluations`
Finalized grades from peer review.
- `id`: (uuid, PK)
- `video_id`: (uuid, FK)
- `evaluator_id`: (uuid, FK references users)
- `overall_score`: (float)
- `notes`: (text)
- `is_final`: (boolean)
- `time_spent_seconds`: (int)
- `created_at`: (timestamptz)

## Security & Privacy
The system utilizes **Supabase RLS** and **Service Role Bypassing** for API routes. 
- **RLS**: Ensures users cannot see data outside their own `organization_id`.
- **RBAC**: Enforced via `users.role` (`admin` has full access, `evaluator` sees assignments, `submitter` sees their own history).
