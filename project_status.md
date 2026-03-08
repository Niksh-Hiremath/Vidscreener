# VidScreener — Project Status & Continuation Guide

> **Generated:** March 8, 2026  
> **Build Status:** ✅ Production build passes with zero TypeScript errors  
> **Supabase Project ID:** `vlqjnasjxapjxdhznifx`

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Database Schema (Current State)](#3-database-schema-current-state)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Feature Status — Admin Portal](#5-feature-status--admin-portal)
6. [Feature Status — Evaluator Portal](#6-feature-status--evaluator-portal)
7. [Feature Status — Submitter Portal](#7-feature-status--submitter-portal)
8. [API Endpoints (Complete Audit)](#8-api-endpoints-complete-audit)
9. [Remaining Static Placeholders](#9-remaining-static-placeholders)
10. [Testing Gaps & Dummy Data](#10-testing-gaps--dummy-data)
11. [MinIO Setup Guide](#11-minio-setup-guide)
12. [Known Bugs & Technical Debt](#12-known-bugs--technical-debt)
13. [Prioritized TODO List](#13-prioritized-todo-list)
14. [File Structure Reference](#14-file-structure-reference)

---

## 1. Project Overview

VidScreener is a multi-tenant video screening platform with three user roles:

- **Admin**: Creates organizations, manages projects, assigns evaluators to videos, views analytics
- **Evaluator**: Reviews assigned videos, submits evaluation scores, tracks review history
- **Submitter**: Submits video applications via forms, tracks submission status

### Multi-Tenancy Model
- Each **organization** has exactly one **admin** (created during admin signup)
- Evaluators and submitters join organizations using an **`org_secret_key`** during signup
- All data is scoped to the organization (projects, videos, evaluators, submissions)

---

## 2. Tech Stack & Environment

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.1.6 (App Router, Turbopack) |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes (BFF pattern) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |
| Object Storage | MinIO (Docker) |
| Charts | Recharts |
| UUID | `uuid` package |

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://vlqjnasjxapjxdhznifx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=<minio-access>
MINIO_SECRET_KEY=<minio-secret>
MINIO_BUCKET=vidscreener
MINIO_USE_SSL=false
```

### Key Libraries
- `@supabase/ssr` — Server-side Supabase client with cookie handling
- `@supabase/supabase-js` — Service role client for admin operations
- `jose` — JWT handling (not heavily used currently)
- `minio` — MinIO client for presigned URLs

---

## 3. Database Schema (Current State)

### Live Data Counts (as of last check)
| Table | Rows | Notes |
|-------|------|-------|
| `organizations` | 3 | Each user created their own org (bug: evaluator/submitter have separate orgs) |
| `users` | 3 | 1 admin, 1 evaluator, 1 submitter |
| `projects` | 1 | Created by admin |
| `rubrics` | 0 | **No rubrics have been created** |
| `rubric_criteria` | 0 | Depends on rubrics |
| `submission_forms` | 0 | **No forms have been created** |
| `form_fields` | 0 | Depends on forms |
| `submissions` | 0 | **No submissions exist** |
| `videos` | 0 | **No videos exist** |
| `evaluator_assignments` | 0 | **No assignments created** |
| `human_evaluations` | 0 | No evaluations |
| `ai_evaluations` | 0 | AI not implemented |
| `notifications` | 0 | Notification system not implemented |

> [!CAUTION]
> **The existing 3 users each belong to DIFFERENT organizations.** The evaluator (`niksh@gmail.com`) and submitter (`eswar@gmail.com`) were created before the `org_secret_key` flow was implemented — they each got their own org. This means the admin (`daiwik@gmail.com`) cannot see them as evaluators. **These users need to be re-created or their `organization_id` manually fixed to test multi-user flows.**

### Existing Users

| User | Email | Role | Organization ID |
|------|-------|------|-----------------|
| Daiwik C | `daiwik@gmail.com` | admin | `0a5fea09-b9cd-44f0-9f6d-d8fdc4aebb55` |
| Niksh Hiremath | `niksh@gmail.com` | evaluator | `0d918a7c-dc9a-4432-9a1e-ab547efb3ca1` |
| THS Eswar | `eswar@gmail.com` | submitter | `89e2f864-6944-4d58-b5e9-e53dadcfe721` |

### Table Details

#### `organizations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `name` | text | Org display name |
| `slug` | text (unique) | URL-safe identifier |
| `subscription_tier` | text | Default: `'free'` |
| `org_secret_key` | text (unique) | Auto-generated 32-char hex, used for evaluator/submitter signup |
| `created_at` | timestamptz | |

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Linked to `auth.users.id` |
| `organization_id` | uuid (FK → organizations) | |
| `full_name` | text | |
| `email` | text (unique) | |
| `role` | text | CHECK: `admin`, `evaluator`, `submitter` |
| `avatar_url` | text (nullable) | Not used in UI yet |
| `created_at` | timestamptz | |

#### `projects`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `organization_id` | uuid (FK → organizations) | |
| `name` | text | |
| `description` | text (nullable) | |
| `status` | text | CHECK: `active`, `archived` |
| `created_by` | uuid (FK → users) | |
| `created_at` | timestamptz | |

#### `evaluator_assignments`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `video_id` | uuid (FK → videos) | |
| `evaluator_id` | uuid (FK → users) | |
| `project_id` | uuid (FK → projects) | |
| `assigned_by` | uuid (FK → users, nullable) | |
| `assigned_at` | timestamptz | |
| `due_date` | timestamptz (nullable) | |
| `status` | text | CHECK: `pending`, `in_progress`, `completed`. Default: `pending` |

#### `videos`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | |
| `submission_id` | uuid (FK → submissions) | |
| `project_id` | uuid (FK → projects) | |
| `original_filename` | text | |
| `mime_type` | text (nullable) | |
| `size_bytes` | bigint (nullable) | |
| `duration_seconds` | int (nullable) | |
| `minio_bucket` | text | Default: `'vidscreener'` |
| `minio_object_key` | text | Path in MinIO bucket |
| `status` | text | CHECK: `uploading`, `uploaded`, `processing`, `ready`, `error` |
| `created_at` | timestamptz | |

> [!IMPORTANT]
> **RLS is DISABLED on ALL tables.** Security relies entirely on API-route-level authorization checks. RLS policies should be added before production use.

---

## 4. Authentication & Authorization

### What's Implemented ✅
- [x] Admin signup (creates new org automatically)
- [x] Evaluator signup (requires `org_secret_key`)
- [x] Submitter signup (requires `org_secret_key`)
- [x] Login for all 3 roles with role-based redirect
- [x] `/api/auth/me` returns current user profile
- [x] `AuthContext` (`useAuth`) hook for dynamic UI across all portals
- [x] Logout functionality (clears cookies, redirects to home)
- [x] Supabase Auth cookies: `sb-access-token`, `sb-refresh-token`

### What's NOT Implemented ❌
- [ ] **Forgot Password** — Pages exist at `/admin/forgot-password`, `/evaluator/forgot-password`, `/submit/forgot-password` but they are **non-functional static forms**. Supabase has a `resetPasswordForEmail()` method that needs to be wired up.
- [ ] **Session Refresh** — No middleware checks token expiry and refreshes tokens. Long sessions may fail silently.
- [ ] **Route Protection** — No middleware redirects unauthenticated users. A user can navigate to `/admin/dashboard` without being logged in and just gets empty data.
- [ ] **RLS Policies** — No row-level security. If someone obtains the anon key, they can query any data.

> Make unified login, register, logout and forgot password pages for all users and redirect according to role for login, and give option of which role to signup as in register.

### Auth Flow
```
Signup → POST /api/auth/signup
         ├── Admin: Creates org + user, sets cookies, returns { user, redirectUrl: '/admin/dashboard' }
         ├── Evaluator: Validates org_secret_key, creates user in that org, sets cookies
         └── Submitter: Same as evaluator

Login  → POST /api/auth/login
         ├── Calls supabase.auth.signInWithPassword()
         ├── Sets access + refresh cookies
         └── Returns { user: { role, org_name }, redirectUrl }

Logout → POST /api/auth/logout
         ├── Calls supabase.auth.signOut()
         └── Clears cookies

Auth Check → GET /api/auth/me
             ├── Reads cookies, calls supabase.auth.getUser()
             └── Returns full profile with org info
```

---

## 5. Feature Status — Admin Portal

### Dashboard (`/admin/dashboard`) — ✅ DYNAMIC
- Fetches real stats from `/api/analytics`
- Shows personalized greeting with user name
- Displays org invite key with copy-to-clipboard
- Quick action links to Projects, Videos, Evaluators

### Projects Page (`/admin/projects`) — ✅ DYNAMIC
- Fetches projects from `/api/projects` (scoped to org)
- "New Project" button creates project via `POST /api/projects`
- Project cards show name, description, submission/assignment counts
- Clicking card navigates to `/admin/projects/[id]`
- **⚠️ BUT:** The "New Project" modal/form was previously a `TODO` — need to verify it works

### Project Detail (`/admin/projects/[id]`) — ✅ MOSTLY DYNAMIC
- Displays project name, description, status
- Shows video stats (uploaded, processing, ready)
- Lists assigned evaluators with progress bars
- **"Add Evaluator" modal** — Fetches evaluators from `/api/evaluators`, fetches unassigned videos, creates assignments
- **⚠️ Missing:** Edit project form, Archive project button, Form builder link
- **⚠️ Missing:** The "Manage Form" button doesn't do anything meaningful

> The sort/filter buttons are also current hardcoded. Needs to be made dynamic.

> There is no option to view/edit project level rubric in this page or anywhere else. The AI and human reviewers use this rubric to grade the videos.

### Admin Form Builder (`/admin/projects/[id]/form`) — ❌ STATIC PLACEHOLDER
- The page exists but is a **static placeholder** with hardcoded form fields
- **Needs:** Dynamic form creation, field ordering, saving to `/api/forms`

### Videos Page (`/admin/videos`) — ✅ DYNAMIC
- Fetches from `/api/videos` (scoped to org)
- Table shows filename, project, status, date
- **⚠️ Shows empty** because no videos exist in DB and MinIO is not set up

### Upload Page (`/admin/upload`) — ❌ STATIC (CRITICAL)
- Has drag-and-drop UI but uses **`SAMPLE_PROJECTS`** constant for project dropdown
- **Does NOT actually upload** files — the "Upload" button does nothing
- Needs to:
  1. Fetch real projects from API
  2. Get presigned upload URL from `/api/videos/upload-url`
  3. Upload file to MinIO via presigned URL
  4. Register video record via `POST /api/videos`

### Evaluators Page (`/admin/evaluators`) — ✅ MOSTLY DYNAMIC
- Fetches evaluators from `/api/evaluators`
- Stats: Total, Active, Reviews, Avg Time are computed from real data
- Performance bar chart uses real evaluator data
- **⚠️ "Invite Evaluator" button label is WRONG** — should be "Add Evaluator" (user explicitly requested this). The concept is that evaluators self-signup using org_secret_key, not that admin "invites" them.
- **⚠️ Remove evaluator functionality** — The API exists (`DELETE /api/evaluators`) but the UI does not wire it up (no delete button in the table)

### Analytics Page (`/admin/analytics`) — ❌ STATIC
- Uses **hardcoded dummy chart data** (score distributions, videos over time, AI agreement)
- Has Recharts components but they render fake data
- Needs to fetch real analytics from `/api/analytics` or compute from submissions/evaluations

### Settings Page (`/admin/settings`) — ✅ DYNAMIC
- Displays user name, email from `useAuth`
- Shows org invite key with copy button
- **⚠️ "Save Changes" button is non-functional** (no API to update profile)
- **⚠️ Password change form is non-functional**

### Rubric Page (`/admin/rubric`) — ❓ NOT VERIFIED
- File exists but purpose is unclear (may be a standalone rubric page vs project-level rubric)

---

## 6. Feature Status — Evaluator Portal

### Dashboard (`/evaluator/dashboard`) — ✅ DYNAMIC
- Fetches assignments from `/api/evaluators/me/assignments`
- Groups by project with progress circles
- Shows review queue (pending assignments)
- Stats: total, pending, completed counts from real data

### My Projects (`/evaluator/projects`) — ✅ DYNAMIC
- Fetches assignments and groups by project
- Shows per-project stats (assigned, pending, completed)
- Links to project detail page

### Project Detail (`/evaluator/projects/[id]`) — ❌ STATIC PLACEHOLDER (CRITICAL)
- **Uses `SAMPLE_VIDEOS` constant** — completely static
- Hardcoded stats: "45 Assigned", "18 Pending", "24 Reviewed", "3 Flagged"
- Video cards use fake applicant names and AI scores
- "Start Review" links are hardcoded to `/evaluator/review/vid-001`
- **Needs:** Fetch assignments for this project via API, render real video cards, link to correct review page

### Review Queue (`/evaluator/queue`) — ✅ DYNAMIC
- Fetches pending assignments from `/api/evaluators/me/assignments`
- Filters for `status === 'pending'`
- Table shows video ID, project, filename, action

### Review Page (`/evaluator/review/[videoId]`) — ⚠️ PARTIALLY DYNAMIC
- Fetches assignment data from `/api/evaluators/me/assignments` (filters for current ID)
- Fetches video playback URL from `/api/videos/[id]/play-url`
- Video player renders (if URL available)
- **⚠️ AI evaluation scores are HARDCODED** — "Communication Skills: 25/30", "Content Relevance: 22/25"
- **⚠️ "Submit Review" sends mock scores** — `{ communication: 25, content: 22, overall: 82 }` — no user input
- **⚠️ "Flag for Admin" button does nothing**
- **⚠️ "Chat with AI" tab says "Pending AI Integration" — disabled**
- **Needs:** Dynamic scoring form based on rubric criteria, actual score submission, review notes input working

### History (`/evaluator/history`) — ✅ DYNAMIC
- Fetches completed assignments from `/api/evaluators/me/assignments`
- Table shows video ID, project, review date, actions
- "View Details" links to review page

### Settings (`/evaluator/settings`) — ❌ STATIC PLACEHOLDER
- **Hardcoded values**: "Daiwik Chilukuri", "daiwik@example.com", "+1 (555) 234-5678"
- Password change form is non-functional
- Notification preferences are non-functional
- Review preferences are non-functional
- **Needs:** Fetch real user data from `/api/auth/me`, implement profile update API

---

## 7. Feature Status — Submitter Portal

### Landing Page (`/submit`) — ✅ WORKS
- Simple form ID input page
- User can enter a form ID and navigate to the form

### Submitter Dashboard (`/submit/dashboard`) — ✅ DYNAMIC (NEW)
- New page created during this session
- Fetches submissions from `/api/submissions`
- Shows stats: total, pending, reviewed
- Links to new submission flow and status pages
- **⚠️ Will show empty** until submissions exist in DB

### Form Submission (`/submit/[formId]`) — ✅ WORKS (API-wise)
- Fetches form from `/api/forms/[formId]`
- Renders dynamic form fields
- Submits to `/api/forms/[id]/submit`
- Supports video upload (if MinIO is configured)

### Submission Success (`/submit/[formId]/success`) — ✅ WORKS
- Shows confirmation with submission ID

### Submission Status (`/submit/status/[submissionId]`) — ✅ DYNAMIC
- Fetches real submission data
- Shows progress pipeline (Submitted → Uploaded → Under Review → Evaluated)
- Displays form responses and video info

### Auth Pages
- **Login** (`/submit/login`) — ✅ Works (redirects to `/submit/dashboard`)
- **Register** (`/submit/register`) — ✅ Works (requires `org_secret_key`)
- **Forgot Password** (`/submit/forgot-password`) — ❌ Non-functional static form

### Layout
- ✅ `AuthProvider` wraps submit layout
- **⚠️ No sidebar** — the submitter portal uses a simple top bar instead

---

## 8. API Endpoints (Complete Audit)

### ✅ Working & Verified
| Method | Route | Notes |
|--------|-------|-------|
| POST | `/api/auth/signup` | Creates org for admin, validates key for others |
| POST | `/api/auth/login` | Returns role-based redirect |
| GET | `/api/auth/me` | Current user profile with org info |
| POST | `/api/auth/logout` | Clears cookies |
| GET | `/api/projects` | Lists org-scoped projects |
| POST | `/api/projects` | Creates project |
| GET | `/api/projects/[id]` | Project with rubrics, forms |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| GET | `/api/projects/[id]/rubric` | Get project rubric |
| PUT | `/api/projects/[id]/rubric` | Upsert rubric + criteria |
| GET | `/api/projects/[id]/submissions` | List project submissions |
| GET | `/api/evaluators` | List evaluators with stats |
| DELETE | `/api/evaluators` | Remove evaluator |
| GET | `/api/evaluators/[id]` | Evaluator detail |
| DELETE | `/api/evaluators/[id]` | Remove evaluator |
| GET | `/api/evaluators/[id]/assignments` | Evaluator's assignments |
| POST | `/api/evaluators/[id]/assignments` | Batch create assignments |
| DELETE | `/api/evaluators/[id]/assignments` | Remove assignments |
| GET | `/api/evaluators/me/assignments` | Current user's assignments |
| GET | `/api/analytics` | Org-scoped analytics |
| POST | `/api/evaluations` | Submit human evaluation |
| GET | `/api/evaluations/[id]` | Evaluation details |
| GET | `/api/submissions` | List submissions |
| GET | `/api/submissions/[id]` | Submission details |
| GET | `/api/forms` | List org forms |
| POST | `/api/forms` | Create form + fields |
| GET | `/api/forms/[id]` | Public form access |
| POST | `/api/forms/[id]/submit` | Submit form (sets `submitted_by` if authenticated) |
| GET | `/api/videos` | List videos |
| POST | `/api/videos` | Register video record |
| GET | `/api/videos/[id]` | Video detail |
| DELETE | `/api/videos/[id]` | Delete video |
| POST | `/api/videos/[id]/evaluate` | AI evaluation stub (mock scores) |
| GET | `/api/videos/[id]/play-url` | Presigned playback URL |
| GET | `/api/videos/[id]/playback-url` | Presigned playback URL (duplicate of above) |
| POST | `/api/videos/upload-url` | Presigned upload URL |

### ⚠️ Known Issues with APIs
1. **`/api/evaluations` POST** — The endpoint expects `rubric_id` but the UI sends `{ scores: {}, notes, status }` — **mismatched request body**. The POST handler checks for `rubric_id` and `overall_score` fields but the review page sends `scores.communication`, `scores.content`, etc.
2. **`/api/videos/[id]/play-url` vs `/api/videos/[id]/playback-url`** — Two routes that do the same thing. One returns `{ url }`, the other `{ playbackUrl }`. **Should be consolidated.**
3. **`/api/analytics`** — Returns basic counts but no time-series data, no score distributions, no evaluator performance aggregations. The admin analytics page needs richer data.

---

## 9. Remaining Static Placeholders

> [!WARNING]
> These are pages/components that still display hardcoded dummy data instead of real API data.

### Critical (Must Fix)
| File | What's Static |
|------|--------------|
| `evaluator/projects/[id]/page.tsx` | **Entire page** uses `SAMPLE_VIDEOS` constant. All stats hardcoded. |
| `admin/upload/page.tsx` | Uses `SAMPLE_PROJECTS` for dropdown. Upload button does nothing. |
| `admin/analytics/page.tsx` | All chart data is dummy (`scoreDistributionData`, `videosOverTimeData`, `aiAgreementData`) |
| `evaluator/settings/page.tsx` | User profile hardcoded: "Daiwik Chilukuri", "daiwik@example.com" |
| `evaluator/review/[videoId]/page.tsx` | AI criteria scores hardcoded. Review submission sends mock scores. |

### Medium (Should Fix)
| File | What's Static |
|------|--------------|
| `admin/evaluators/page.tsx` | "Invite Evaluator" button label (should be "Add Evaluator"). No delete button. |
| `admin/projects/[id]/form/page.tsx` | Entire form builder is static |
| `admin/rubric/page.tsx` | Not clear if functional |
| `evaluator/settings/page.tsx` | Password change, notification preferences non-functional |
| `admin/settings/page.tsx` | "Save Changes" non-functional |

### Low (Nice to Have)
| File | What's Static |
|------|--------------|
| `help/page.tsx` | Static help page |
| `support/page.tsx` | Static support page |
| `notifications/page.tsx` | Non-functional notifications page |
| `logout/page.tsx` | Redirect page (may be unused since logout is now in sidebars) |

---

## 10. Testing Gaps & Dummy Data

> [!CAUTION]
> **NO TESTING HAS BEEN PERFORMED.** The user explicitly requested creating dummy data in Supabase to test all features. This was NOT done.

### What Needs to Be Tested (Step-by-Step Test Plan)

#### Test 1: Admin Creates Project → Dashboard Updates
1. Login as admin (`daiwik@gmail.com`)
2. Navigate to `/admin/projects`
3. Click "New Project", create "Test Project 1"
4. Verify: Dashboard shows 2 total projects (was 1)
5. Verify: Project card appears in project list

#### Test 2: Evaluator Signup via Org Key
1. Get the admin's org secret key from Dashboard or Settings
2. Navigate to `/evaluator/register`
3. Sign up a new evaluator (`evaluator1@test.com`) using the org key
4. Login as admin — verify new evaluator appears in `/admin/evaluators`

#### Test 3: Admin Assigns Videos to Evaluator
**Prereq:** Need videos in the database (see MinIO setup below) and evaluators in same org
1. Navigate to `/admin/projects/[id]`
2. Click "Add Evaluator"
3. Select evaluator from dropdown, select videos
4. Submit assignment
5. Login as evaluator — verify assignment appears in dashboard, queue, and projects

#### Test 4: Evaluator Reviews Video
**Prereq:** Working video assignment + MinIO video playback
1. Login as evaluator
2. Navigate to Review Queue
3. Click "Start Review"
4. Verify video player loads (requires MinIO)
5. Submit review
6. Verify: Assignment status changes to `completed`
7. Verify: Review appears in History

#### Test 5: Submitter Submits Application
**Prereq:** Admin must create a form first
1. Admin creates a submission form via `/api/forms` (or through form builder when implemented)
2. Submitter navigates to `/submit/[formId]`
3. Fills out form, uploads video
4. Submits
5. Verify: Submission appears in `/submit/dashboard`
6. Verify: Video appears in admin's video list
7. Verify: Submission appears in admin's project detail

### Dummy Data Required for Testing

The following SQL can be run via Supabase MCP to create test data:

```sql
-- Step 1: Fix the existing evaluator to belong to the admin's org
-- (Currently they're in separate orgs)
UPDATE users 
SET organization_id = '0a5fea09-b9cd-44f0-9f6d-d8fdc4aebb55'  -- admin's org
WHERE email = 'niksh@gmail.com';

-- Step 2: Fix the existing submitter similarly
UPDATE users 
SET organization_id = '0a5fea09-b9cd-44f0-9f6d-d8fdc4aebb55'
WHERE email = 'eswar@gmail.com';

-- Step 3: Create a dummy rubric for the existing project
INSERT INTO rubrics (project_id, name, description) 
SELECT id, 'Default Rubric', 'Evaluation criteria for this project'
FROM projects LIMIT 1;

-- Step 4: Create rubric criteria
INSERT INTO rubric_criteria (rubric_id, name, description, max_points, weight, order_index)
SELECT r.id, 'Communication Skills', 'Clarity, confidence, articulation', 30, 0.3, 0
FROM rubrics r LIMIT 1;

INSERT INTO rubric_criteria (rubric_id, name, description, max_points, weight, order_index)
SELECT r.id, 'Content Quality', 'Relevance, depth, accuracy', 40, 0.4, 1
FROM rubrics r LIMIT 1;

INSERT INTO rubric_criteria (rubric_id, name, description, max_points, weight, order_index)
SELECT r.id, 'Technical Presentation', 'Demos, visuals, structure', 30, 0.3, 2
FROM rubrics r LIMIT 1;

-- Step 5: Create a submission form
INSERT INTO submission_forms (project_id, title, instructions, requires_video)
SELECT id, 'Application Form', 'Please submit your video introduction', true
FROM projects LIMIT 1;

-- Step 6: Create form fields
INSERT INTO form_fields (form_id, label, field_type, is_required, order_index)
SELECT sf.id, 'Full Name', 'text', true, 0
FROM submission_forms sf LIMIT 1;

INSERT INTO form_fields (form_id, label, field_type, is_required, order_index)
SELECT sf.id, 'Why are you interested?', 'textarea', true, 1
FROM submission_forms sf LIMIT 1;
```

> [!NOTE]
> After running the above, you'll also need dummy videos. Since MinIO is required for actual video files, you can insert **video records without actual files** to test assignment flows:
> ```sql
> INSERT INTO videos (submission_id, project_id, original_filename, minio_object_key, status)
> VALUES 
>   -- These need a valid submission_id or you'll need to make submission_id nullable
>   -- Currently submission_id is NOT NULL, which is a problem for admin-uploaded videos
> ```
> **This reveals a schema issue:** `videos.submission_id` is NOT NULL, but admin-uploaded videos won't have a submission. The column should be made nullable.

---

## 11. MinIO Setup Guide

MinIO is used for video file storage. It runs as a Docker container.

### Setup Steps

```bash
# 1. Start MinIO container
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# 2. Access MinIO Console at http://localhost:9001
#    Login: minioadmin / minioadmin

# 3. Create the bucket "vidscreener" via the console or CLI:
docker exec minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec minio mc mb local/vidscreener
```

### How Video Upload Works (intended flow)
1. Client calls `POST /api/videos/upload-url` with `{ organization_id, project_id, filename }`
2. API returns `{ uploadUrl, minio_object_key }`
3. Client sends file directly to MinIO using the presigned `uploadUrl` (PUT request)
4. Client calls `POST /api/videos` to register the video record with the `minio_object_key`

### How Video Playback Works
1. Client calls `GET /api/videos/[id]/play-url`
2. API generates a presigned GET URL for the MinIO object
3. Client uses the URL in a `<video>` element

### Current State
- MinIO **lib** exists at `lib/minio.ts` with `generateUploadUrl()`, `generatePlaybackUrl()`, `buildObjectKey()` functions
- The admin Upload page does **NOT** call these functions — it's still static
- **No videos exist** in the system

### To Manually Add a Test Video
1. Start MinIO container
2. Upload a `.mp4` file to the `vidscreener` bucket in the folder structure: `{org_id}/{project_id}/{submission_id}/{filename}`
3. Insert a corresponding `videos` row in Supabase with the `minio_object_key` matching the path
4. Now the video should be visible in admin Videos page and assignable to evaluators

---

## 12. Known Bugs & Technical Debt

### Bugs
1. **`videos.submission_id` is NOT NULL** — Admin-uploaded videos won't have a submission. Need to make it nullable via migration.
2. **Evaluation POST body mismatch** — The review page sends `{ scores: { communication, content, overall }, notes }` but the API expects `{ video_id, rubric_id, overall_score, notes, criteria_scores }`. The review submission will fail.
3. **Duplicate playback URL routes** — `/api/videos/[id]/play-url` and `/api/videos/[id]/playback-url` both exist and do the same thing.
4. **`SAMPLE_PROJECTS` and `SAMPLE_VIDEOS` constants** still used by upload page and evaluator project detail page.
5. **Forgot password pages** are forms without any backend logic.

### Technical Debt
1. **No RLS** — All tables have `rls_enabled: false`.
2. **No error boundaries** — API errors show as blank screens or `useEffect` console errors.
3. **No loading skeletons** — Most pages show just "Loading..." text.
4. **No pagination** — All list pages fetch everything at once.
5. **No form validation** — Signup/login forms have basic HTML validation but no schema validation.
6. **`lib/constants.ts`** still contains `SAMPLE_PROJECTS` and `SAMPLE_VIDEOS` that should be removed.
7. **`docs/` folder is outdated** — The 6 docs files (API_ENDPOINTS.md, ARCHITECTURE.md, etc.) have NOT been updated to reflect the current implementation.

---

## 13. Prioritized TODO List

### 🔴 Priority 1 — Critical for E2E Testing

- [ ] **Fix `videos.submission_id` to be nullable** — Admin-uploaded videos have no submission
- [ ] **Fix evaluator/submitter org_id** — Update existing users to share admin's org for testing
- [ ] **Create dummy data** — Run the SQL above to populate rubrics, forms, form fields
- [ ] **Create dummy video records** — Even without MinIO files, insert video rows to test assignment flow
- [ ] **Test admin → evaluator flow** — Create project, assign evaluator, verify evaluator sees assignment
- [ ] **Fix evaluation POST body** — Make the review page's "Submit Review" actually work with the API's expected format

### 🟡 Priority 2 — Remaining Static Pages

- [ ] **`evaluator/projects/[id]/page.tsx`** — Convert from `SAMPLE_VIDEOS` to dynamic API data. Fetch assignments for this evaluator + project.
- [ ] **`admin/upload/page.tsx`** — Wire up to real projects API and MinIO presigned upload URLs
- [ ] **`admin/analytics/page.tsx`** — Fetch real data from a new analytics API or extend existing one
- [ ] **`evaluator/settings/page.tsx`** — Fetch and display real user data from `useAuth`
- [ ] **`admin/evaluators/page.tsx`** — Change "Invite Evaluator" to "Add Evaluator"; add delete button
- [ ] **`admin/projects/[id]/form/page.tsx`** — Implement form builder

### 🟢 Priority 3 — Feature Completeness

- [ ] **Forgot password flow** — Wire up Supabase `resetPasswordForEmail()`
- [ ] **Notifications system** — Create/fetch notifications API, show in TopNav and notifications page
- [ ] **Auth middleware** — `middleware.ts` to protect routes and refresh tokens
- [ ] **Profile update API** — `PUT /api/auth/me` or similar
- [ ] **Consolidate playback URL routes** — Remove duplicate
- [ ] **Remove `lib/constants.ts` sample data** — Delete `SAMPLE_PROJECTS`, `SAMPLE_VIDEOS`
- [ ] **Update docs/** — Rewrite all 6 documentation files

### 🔵 Priority 4 — Production Readiness

- [ ] **Enable RLS** — Write policies for all tables
- [ ] **Error handling** — Add error boundaries, toast notifications
- [ ] **Loading states** — Add skeleton loaders
- [ ] **Input validation** — Zod schemas for API routes
- [ ] **AI Integration** — Replace mock AI evaluation with Gemini API  
- [ ] **Cleanup unused files** — Remove stale migration SQL files in `app/api/supabase-mcp-server_apply_migration/`

---

## 14. File Structure Reference

```
vidscreener/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts          ✅ Working
│   │   │   ├── logout/route.ts         ✅ Working
│   │   │   ├── me/route.ts             ✅ Working (new)
│   │   │   └── signup/route.ts         ✅ Working (rewritten)
│   │   ├── analytics/route.ts          ⚠️ Basic metrics only
│   │   ├── evaluations/
│   │   │   ├── route.ts                ⚠️ Body mismatch with UI
│   │   │   └── [id]/route.ts           ✅ Working
│   │   ├── evaluators/
│   │   │   ├── route.ts                ✅ Working
│   │   │   ├── [id]/route.ts           ✅ Working
│   │   │   ├── [id]/assignments/route.ts ✅ Working
│   │   │   └── me/assignments/route.ts ✅ Working
│   │   ├── forms/
│   │   │   ├── route.ts                ✅ Working
│   │   │   ├── [id]/route.ts           ✅ Working
│   │   │   └── [id]/submit/route.ts    ✅ Working (updated)
│   │   ├── projects/
│   │   │   ├── route.ts                ✅ Working
│   │   │   └── [id]/
│   │   │       ├── route.ts            ✅ Working
│   │   │       ├── rubric/route.ts     ✅ Working
│   │   │       └── submissions/route.ts ✅ Working
│   │   ├── submissions/
│   │   │   ├── route.ts                ✅ Working
│   │   │   └── [id]/route.ts           ✅ Working
│   │   └── videos/
│   │       ├── route.ts                ✅ Working
│   │       ├── upload-url/route.ts     ✅ Working
│   │       └── [id]/
│   │           ├── route.ts            ✅ Working (new)
│   │           ├── evaluate/route.ts   ⚠️ Mock AI scores
│   │           ├── play-url/route.ts   ✅ Working
│   │           └── playback-url/route.ts ✅ Duplicate, remove
│   ├── admin/
│   │   ├── layout.tsx                  ✅ Has AuthProvider
│   │   ├── dashboard/page.tsx          ✅ Dynamic
│   │   ├── projects/
│   │   │   ├── page.tsx                ✅ Dynamic
│   │   │   └── [id]/
│   │   │       ├── page.tsx            ✅ Dynamic (with assign modal)
│   │   │       └── form/page.tsx       ❌ Static placeholder
│   │   ├── videos/page.tsx             ✅ Dynamic (empty data)
│   │   ├── upload/page.tsx             ❌ Static (SAMPLE_PROJECTS)
│   │   ├── evaluators/page.tsx         ⚠️ "Invite" label, no delete
│   │   ├── analytics/page.tsx          ❌ Static dummy data
│   │   ├── settings/page.tsx           ✅ Dynamic (save non-functional)
│   │   ├── rubric/page.tsx             ❓ Unknown status
│   │   ├── login/page.tsx              ✅ Working
│   │   ├── register/page.tsx           ✅ Working (with org name)
│   │   └── forgot-password/page.tsx    ❌ Non-functional
│   ├── evaluator/
│   │   ├── layout.tsx                  ✅ Has AuthProvider
│   │   ├── dashboard/page.tsx          ✅ Dynamic
│   │   ├── projects/
│   │   │   ├── page.tsx                ✅ Dynamic
│   │   │   └── [id]/page.tsx           ❌ STATIC (SAMPLE_VIDEOS)
│   │   ├── queue/page.tsx              ✅ Dynamic
│   │   ├── review/[videoId]/page.tsx   ⚠️ Partially dynamic
│   │   ├── history/page.tsx            ✅ Dynamic
│   │   ├── settings/page.tsx           ❌ Static placeholders
│   │   ├── login/page.tsx              ✅ Working
│   │   ├── register/page.tsx           ✅ Working (org key)
│   │   └── forgot-password/page.tsx    ❌ Non-functional
│   ├── submit/
│   │   ├── layout.tsx                  ✅ Has AuthProvider
│   │   ├── page.tsx                    ✅ Form ID input
│   │   ├── dashboard/page.tsx          ✅ Dynamic (new)
│   │   ├── [formId]/
│   │   │   ├── page.tsx                ✅ Dynamic form
│   │   │   └── success/page.tsx        ✅ Works
│   │   ├── status/[submissionId]/page.tsx ✅ Dynamic (new)
│   │   ├── login/page.tsx              ✅ Working
│   │   ├── register/page.tsx           ✅ Working (org key)
│   │   └── forgot-password/page.tsx    ❌ Non-functional
│   ├── help/page.tsx                   ❌ Static
│   ├── support/page.tsx                ❌ Static
│   ├── notifications/page.tsx          ❌ Non-functional
│   ├── logout/page.tsx                 ⚠️ May be unused
│   └── page.tsx                        ✅ Landing page
├── components/
│   ├── layout/
│   │   ├── AdminSidebar.tsx            ✅ Dynamic (name, org, logout)
│   │   ├── EvaluatorSidebar.tsx        ✅ Dynamic (name, logout)
│   │   ├── TopNav.tsx                  ✅ Dynamic (user name)
│   │   ├── MainContent.tsx             ✅ Layout wrapper
│   │   └── Logo.tsx                    ✅ Shared logo component
│   └── charts/
│       ├── BarChart.tsx                ✅ Recharts wrapper
│       ├── LineChart.tsx               ✅ Recharts wrapper
│       └── PieChart.tsx                ✅ Recharts wrapper
├── lib/
│   ├── AuthContext.tsx                 ✅ Auth state management (new)
│   ├── supabase.ts                     ✅ Service + server clients
│   ├── minio.ts                        ✅ Upload/playback URL generation
│   ├── constants.ts                    ⚠️ Still has SAMPLE_* data
│   └── types.ts                        ✅ TypeScript interfaces
├── utils/
│   └── supabaseServerClient.ts         ✅ Cookie-based auth client
├── docs/                               ❌ Outdated (6 files)
├── .env.local                          ✅ Configured
├── next.config.ts                      ✅
├── tailwind.config.ts                  ✅
└── package.json                        ✅
```

---

## Quick Reference: How to Continue

1. **Read this document** — You now understand what's done and what's not
2. **Fix the org_id issue** — Run `UPDATE users SET organization_id = '...'` for evaluator/submitter
3. **Create dummy data** — Use the SQL in Section 10
4. **Start the dev server** — `npm run dev` (or `npx next dev --turbopack`)
5. **Test login flows** — Verify admin, evaluator, submitter can all log in
6. **Start fixing Priority 1 items** — Focus on making the E2E flow work
7. **Then fix static pages** — Priority 2 items

> [!TIP]
> The Supabase project is accessible via MCP tools. You can run SQL queries, apply migrations, and check table contents directly without needing to use the Supabase dashboard.
