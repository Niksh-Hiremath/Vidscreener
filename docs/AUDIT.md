# VidScreener — Audit Report

> **Audited:** 2026-03-28
> **Scope:** Full codebase — frontend pages, API routes, database schema, auth, UI components
> **Approach:** Systematic file-by-file review against the project's stated vision in `CLAUDE.md`

---

## Executive Summary

VidScreener is a partially-implemented AI-assisted video evaluation platform. The frontend UI has a cohesive dark-mode design system, but **the backend has significant gaps and all AI-powered features are entirely missing**. The platform currently provides human review infrastructure without any actual AI processing pipeline.

**Risk:** Running this in production would present a fully-functional evaluation workflow to users who would reasonably expect AI-assisted scoring — which does not exist.

---

## Severity Key

| Rating | Meaning |
|--------|---------|
| 🔴 Critical | Security vulnerability, data integrity risk, or completely broken workflow |
| 🟠 Major | Significant missing functionality or broken user journey |
| 🟡 Minor | Polish, UX refinement, or nice-to-have |

---

## 1. Authentication & Authorization

### 🔴 Critical

**`app/middleware.ts`** — JWT token existence check only, no signature validation
- The middleware only checks if a `token` cookie exists (`cookie.has("token")`)
- It does **not** validate the JWT signature or expiration
- Any forged cookie with the name `"token"` would pass through unprotected routes
- **Fix required:** Call `getUserFromJWT` or equivalent to validate the token properly

**`wrangler.toml` (line 7)** — JWT secret hardcoded in config
```toml
JWT_SECRET = "supersecret-1234567890-securekey"
```
- Should only exist in `.dev.vars` (environment variable), never committed to version control

**No centralized role-based access control**
- Middleware only protects `/dashboard/*`
- Submitter form URLs like `/dashboard/submitter/applications/[projectId]/fill` are accessible until the page-level API call returns 403
- No route-level role guard that redirects unauthorized users

### 🟠 Major

**No password reset / forgot password flow**
- `app/login/page.tsx` line 90: "Forgot password?" link → `/forgot-password` (does not exist)

**No session refresh mechanism**
- JWT expires in 7 days with no refresh token or session refresh endpoint
- Users must manually re-login after expiration

**No server-side token invalidation**
- `handleLogout` (`wrangler/routes.ts` line 76) only clears the cookie client-side
- If a token is stolen, it remains valid until natural expiration

**Inconsistent role enforcement in API routes**
- Some routes check `user.role !== "admin"` (lines 520, 583)
- Others check `user.role !== "reviewer" && user.role !== "evaluator"` (lines 1682, 1726)
- `handleSubmitterExplore` (line 2347) only checks `if (!user)` — a submitter exploring all active projects should require `reviewer` or `evaluator` role

### 🟡 Minor

**`wrangler/routes.ts` line 99** — Role name normalization
- `roleName.toLowerCase()` is applied, but unclear whether `evaluator` and `reviewer` are distinct roles or aliases in the database

---

## 2. Dashboard Pages

### 🔴 Critical — Mock Data in Production

**`app/dashboard/analytics/page.tsx`** — Entirely mocked data
- All metrics (1,204 submissions, 4.2% deviation, 42/day throughput) are hardcoded static values (lines 24–50, 79–106)
- SVG chart data is decorative only — no `fetch()` calls to any API
- Users see fake analytics that do not reflect real system state

**`app/dashboard/review-queue/page.tsx` (lines 42–49)** — Mock data injected in production
```javascript
// Inject some mock data if queue is totally empty for design preview purposes.
if (!payload.queue || payload.queue.length === 0) {
   setQueue([
     { id: 1, projectId: 101, projectName: "YCL Admissions 2026", title: "Applicant #4022", status: "pending" },
     // ... more mock entries
   ]);
}
```
- This runs in production, not just development
- Evaluators may unknowingly review fake applications

**`app/dashboard/review-queue/[videoId]/page.tsx` (lines 104–128)** — Mock fallback on 404
- When API returns "Not found" (video not in user's queue), page falls back to full mock data + w3schools sample video URL
- Should surface an error to the user instead of silently substituting fake data

**`app/dashboard/review-queue/[videoId]/page.tsx` (lines 508–530)** — AI Chat panel disabled
- Input is `disabled` with `cursor-not-allowed` and placeholder text
- No backend endpoint exists to process chat queries
- **UI exists but feature is completely non-functional**

**`app/dashboard/review-queue/[videoId]/page.tsx` (lines 316–408)** — AI Review Analysis mock only
- `getMockAiScore()` returns deterministic fake scores based on rubric ID
- Confidence signal block with timestamps and segments is decorative mock UI
- No real AI analysis is ever fetched or displayed

### 🟠 Major

**`app/dashboard/projects/VideoPlayerCard.tsx` (lines 18–19)** — No title overflow handling
- Long video titles overflow the card without ellipsis or `line-clamp`
- No `truncate` or overflow CSS applied

**No empty states for submitter explore page**
- When no programs exist or API fails silently, the page shows a loading skeleton indefinitely

**No loading/disabled states on form builder during save**
- `saveForm` sets `saving` state but form fields don't reflect a disabled/processing state

**Review detail — no keyboard-accessible tab panels**
- Tab buttons use `onClick` only, no `role="tablist"`, no arrow-key navigation
- Not accessible to keyboard/screen reader users

**No upload progress indicator**
- After clicking submit on a video form, there is no progress bar or status feedback
- User waits with no confirmation anything is happening

### 🟡 Minor

**`app/dashboard/analytics/page.tsx` (line 105)** — Hardcoded month
```javascript
<span>Aug 1</span><span>Aug 8</span>...
```
- Always shows August dates regardless of current month

**Inconsistent CSS variable naming**
- Some components use `--foreground` / `--background` (Tailwind defaults)
- Others use `--color-text` / `--color-bg` (brand tokens from CLAUDE.md)
- Creates visual inconsistencies across pages

**No loading skeletons on videos and evaluators pages**
- Pages show "Loading..." text instead of skeleton loaders

**No toast/notification system anywhere**
- Success/error actions have no visible confirmation
- Users may not realize their save succeeded or failed

---

## 3. API Routes (wrangler/routes.ts)

### 🔴 Critical — Missing Core Endpoints

**No AI processing endpoints exist at all**
- No endpoint to trigger AI evaluation of a video
- No endpoint to retrieve AI-generated analysis, scores, confidence, or flags
- No endpoint to get transcript data or semantic segmentation results
- The entire AI evaluation pipeline is unimplemented

**No video upload endpoint for real submissions**
- `handleProjectFormTestSubmit` (line 1141) is labeled "test-submit" — only for admin testing
- `handleSubmitterSubmitForm` (line 2270) uploads to R2 but no downstream processing pipeline exists

**No bulk operations**
- No bulk video assignment, status updates, or delete

**No data export**
- No CSV/JSON export for reviews, scores, or analytics

### 🟠 Major — Incomplete CRUD

**Projects — No update or delete**
- `handleProjectDetail` (line 618) is GET only
- No `DELETE /api/projects/[id]`
- No `PATCH /api/projects/[id]`

**Rubrics — Delete is destructive full-replace** (line 1053)
```javascript
await db.delete(schema.projectRubrics).where(eq(schema.projectRubrics.projectId, projectId));
// Then re-insert all
```
- No transactional safety, no per-rubric update/delete

**Forms — Only full-form replace**
- No add/update/delete individual fields
- Only full-form save (replace all fields)

**No user management**
- Can't list users in an organization
- Can't update user roles
- Can't delete or deactivate users

**No organization management beyond create**
- No organization update or delete
- No invite-user endpoint (only "add as admin")

### 🟠 Major — Validation & Security

**No request body validation library**
- Each handler manually checks types with `typeof` — error-prone
- No Zod, Yup, or Joi schema validation

**No rate limiting** on any endpoint

**CORS restricted to localhost only** (`wrangler/utils/cors.ts`)
```javascript
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
```
- Production deployment would fail unless explicit domains are added

### 🟡 Minor

**No structured logging** — API routes use `console.error` with no log levels or format

**No pagination on any list endpoint**
- `handleProjectsList`, `handleEvaluatorReviewQueue` return ALL records
- Will break at scale with large datasets

---

## 4. Database Schema (db/schema.ts)

### 🔴 Critical — Missing Tables

**No `sessions` table**
- JWT is stateless — no server-side way to invalidate sessions
- Listed as a future direction in CLAUDE.md but needs to be addressed

**No `audit_logs` table**
- No tracking of who did what when
- Critical for compliance and accountability

**No `notifications` table**
- No user notification system

**No `transcripts` or `video_analysis` table**
- No place to store AI transcription results
- No place to store semantic segmentation data

**No `rubric_scores` table (separate from reviews)**
- Scores are stored as JSON inside `projectVideoReviews.rubricBreakdownJson`
- Can't efficiently query "all scores for rubric X across all videos"

**No `flags` or `quality_signals` table**
- No place to store AI-generated flags like "low audio quality", "multilingual content", etc.

### 🟠 Major — Missing Fields

**`users` table (line 19)** — Missing common fields
- No `avatarUrl`
- No `lastLoginAt`
- No `isActive` / `isDeleted` soft-delete
- No `emailVerified`
- No `passwordChangedAt`

**`organizations` table (line 10)** — Too minimal
- No `slug` for vanity URLs
- No `description`
- No `logoUrl`
- No `settings` JSON column

**`roles` table (line 4)** — Only has name
- No `description`
- No `permissions` JSON
- No granular permission system

**`projects` table (line 34)** — Missing scheduling fields
- No `deadline`, `startDate`, or `endDate`
- No `maxSubmissions`
- No `settings` JSON for project-specific config

**No `invite_tokens` or `share_links` table**
- Form sharing relies on `projectFormShares` but no expiring invite link system

### 🟡 Minor

**No indexes defined on foreign keys**
- `projectId`, `organizationId`, `evaluatorId` columns lack indexes for query performance

**SQLite/D1 limitations**
- No cascading deletes defined at schema level
- App must manually delete child records first

**`files` table (line 29) is orphaned** — Defined but unused, dead code

---

## 5. UI Components

### 🔴 Critical

**Analytics dashboard completely non-functional**
- All charts, metrics, and data visualizations are hardcoded SVG — no real data
- "Export Signals" button does nothing

**AI Chat panel disabled and non-functional** (review detail page)
- Input is `disabled` — users cannot type questions
- No backend endpoint to process queries

**AI Review Analysis panel shows mock data only**
- `getMockAiScore()` generates fake scores deterministically
- Timestamps and "confidence segments" are decorative only

### 🟠 Major

**VideoPlayerCard has no error handling**
- If video fails to load, shows broken player with no error message or fallback
- No `onError` handler

**No toast/notification system**
- Success/error messages disappear with no visible confirmation
- Users may miss that their action succeeded or failed

**No loading skeletons on some pages**
- Videos page and Evaluators page show "Loading..." text instead of proper skeletons

**Review detail — tabs not keyboard accessible**
- No `role="tablist"` / `role="tab"` / `role="tabpanel"` attributes
- No arrow-key navigation between tabs

### 🟡 Minor

**Inconsistent CSS variable naming** — `--foreground` vs `--color-text` across codebase

**RoleSelect dropdown** — Could use `aria-labelledby` to reference the label element for better screen reader experience

**Loading spinner on submit button** — Already uses `disabled` and `aria-disabled`, good practice

---

## 6. Workflow Completeness

### Video Upload Flow — PARTIALLY COMPLETE

**Works:**
- Submitters can fill form and upload video via `handleSubmitterSubmitForm`
- File uploads to R2 with correct MIME type metadata
- Attachment records created in database

**Missing:**
- No chunked upload for large files
- No upload progress indicator
- No resumable uploads
- No video processing status tracking (queued → processing → ready)
- No video duration/dimension extraction after upload
- No automatic thumbnail generation

### AI Evaluation Pipeline — NOT IMPLEMENTED

**All entirely missing:**
- No transcription pipeline (no Whisper/Deepgram integration)
- No semantic segmentation
- No multimodal LLM integration for scoring
- No confidence scoring
- No flag generation (audio quality, compliance, language)
- `aiReviewJson` column in `projectVideoReviews` is always NULL

### Human Review Flow — MOSTLY COMPLETE

**Works:**
- Evaluators can see their review queue
- Evaluators can view video and form submission
- Evaluators can score rubrics and save reviews
- Scores persist to `projectVideoReviews` table

**Missing:**
- AI pre-populated scores (blocked on AI pipeline)
- Timestamp-grounded evidence from AI (blocked on AI pipeline)
- Flag displays from AI (mocked in UI only)
- "AI confidence signal" timeline (decorative mock only)

### Score Finalization — BASIC

**Works:**
- Evaluator saves review, `reviewStatus` set to "reviewed"
- `reviewedAt` timestamp recorded

**Missing:**
- No confirmation dialog before finalizing
- No "unsubmit" or "reopen" if evaluator made a mistake
- No automatic notification to admin when review is completed
- No side-by-side score comparison view (AI vs Human)

### Analytics/Reporting — NOT FUNCTIONAL

- No real API endpoints for analytics
- No data aggregation pipeline
- No AI vs Human comparison data
- No evaluator consistency tracking

---

## 7. Key Features Status (from CLAUDE.md)

| Feature | Status | Notes |
|---------|--------|-------|
| **AI-Powered Evaluation** | 🔴 NOT IMPLEMENTED | No API endpoints, no AI integration, `aiReviewJson` always NULL |
| **Semantic Segmentation** | 🔴 NOT IMPLEMENTED | No API, no DB table |
| **Explainability Engine** | 🟠 UI EXISTS, NO BACKEND | Review detail page has UI but all data is mock |
| **AI Chat Assistant** | 🔴 UI EXISTS, DISABLED | Input disabled, no endpoint |
| **Human-in-the-Loop Review** | 🟠 PARTIAL | Basic flow works, no AI assistance |
| **AI vs Human Calibration** | 🔴 MOCK UI ONLY | Analytics shows fake charts |
| **Smart Video Processing** | 🔴 NOT IMPLEMENTED | No transcription, no frame sampling |
| **Language Handling** | 🔴 NOT IMPLEMENTED | No detection, no enforcement per project |

---

## 8. Feature Implementation Roadmap

### Phase 0 — Security & Polish (Must do first)

1. ~~Fix JWT middleware validation (`app/middleware.ts`)~~ ✅
2. ~~Move JWT secret out of `wrangler.toml` into `.dev.vars`~~ ✅
3. ~~Remove mock data injection in production (`review-queue/page.tsx`)~~ ✅
4. ~~Remove silent 404 mock fallback (`review-queue/[videoId]/page.tsx`)~~ ✅
5. ~~Add password reset / forgot password flow~~ ✅
   - Added `passwordResetTokens` table to `db/schema.ts`
   - Added `handleForgotPassword` handler: generates UUID token, bcrypt-hashes it, stores with 1h expiry, logs reset URL (swap `console.log` for email service in production via `APP_URL` env var)
   - Added `handleResetPassword` handler: validates token hash + expiry, marks token used, updates password with bcrypt
   - Registered `POST /api/auth/forgot-password` and `POST /api/auth/reset-password` routes
   - Created `app/forgot-password/page.tsx` — email entry, success state, email enumeration protected
   - Created `app/reset-password/page.tsx` — token+email from query params, password + confirm fields, Suspense-wrapped for `useSearchParams`
6. ~~Skip~~ — JWT already set to 7d; sufficient for current scope
7. ~~Skip~~ — would require sessions table + token blacklist; not critical for MVP
8. ~~Skip for now~~ — per-page error/success display is sufficient until a full toast system is prioritized

#### Assign Videos Page — Completed
- ✅ Fix double-counting: backend now uses `additionalCount` (delta), not `count` (total)
- ✅ Fix "current count shows wrong after remove" with optimistic UI updates
- ✅ Add remove mode: unassign specific videos from evaluators
- ✅ Auto-distribute evenly: splits unassigned videos equally across all evaluators

### Phase 1 — Core CRUD Completeness

1. ~~Add PATCH/DELETE endpoints for projects~~ ✅
   - Added `handleUpdateProject` (PATCH): updates name, description, status with validation
   - Added `handleDeleteProject` (DELETE): cascades through all child records — rubrics, forms, submissions, attachments (R2 cleanup), form shares, project videos, project evaluators
   - Registered `PATCH/DELETE /api/projects/{id}` routes
   - Project detail page: "Edit Project" button in header → inline form with name/description/status dropdown
   - Project detail page: "Danger Zone" section at bottom with Delete Project button → typed-name confirmation dialog
   - Projects list page: trash icon on each card (hover to reveal) → same confirmation dialog → redirects to list after delete
   - Fixed CORS: `Access-Control-Allow-Methods` now includes PATCH and DELETE
   - Fixed overview endpoint: `description` and `status` now visible in project detail header
2. ~~Add per-rubric update/delete (replace destructive full-replace)~~ ✅
   - Added `handleUpdateProjectRubric` (PATCH `/api/projects/{id}/rubrics/{rubricId}`): updates title, description, or weight individually. **Weight constraint enforced**: changing a weight is rejected if the new total ≠ 100%, with a clear error showing what the new total would be.
   - Added `handleDeleteProjectRubric` (DELETE `/api/projects/{id}/rubrics/{rubricId}`): deletes one rubric, prevents deleting the last rubric (must have at least one). Remaining rubrics keep their weights — save button stays disabled until total = 100 again.
   - Full save via POST still works as before (delete all → re-insert all, must total 100)
   - No frontend changes needed — existing UI already handles granular operations (add/delete rows, weight bar, save-disabled-until-100)
3. ~~Add per-form-field operations~~ ✅
   - Added `handleProjectFormField` (PATCH/DELETE `/api/projects/{id}/form/fields/{index}`): updates or deletes a single field by array index. DELETE is rejected for the mandatory video field.
   - Added `handleAddProjectFormField` (POST `/api/projects/{id}/form/fields`): appends a new field to the form array. New field defaults to text type unless specified.
   - `handleProjectForm` (POST, existing): full save still works as-is (delete all → replace with incoming array), enforces mandatory video field constraint.
   - Fields are stored as JSON array in `fieldsJson` column — no schema changes needed. Index-based operations are stable within a session; no competing edits assumed.
   - No frontend changes needed — existing form builder UI already manages per-field state client-side.
4. ~~Add user management endpoints (list, update role, delete)~~ ✅
   - Added `handleOrganizationUsers` (GET `/api/organization/users`): returns all users in the org with their role names and IDs, marks superadmin
   - Added `handleUpdateUserRole` (PATCH `/api/organization/users/{userId}/role`): changes a user's role. Only superadmin can promote to/from admin. Prevents changing superadmin role unless you're superadmin.
   - Added `handleDeleteUser` (DELETE `/api/organization/users/{userId}`): removes user from org (nullifies organizationId). Can't delete self or superadmin without being superadmin.
   - Registered routes in `wrangler/index.ts`
5. Add organization management (update, delete, invite user)
6. Add pagination to all list endpoints
7. Add bulk operations (bulk assign, bulk status update, bulk delete)
8. Add data export (CSV/JSON) for reviews and analytics

### Phase 2 — Video Pipeline

1. Add chunked/resumable video upload with progress indicator
2. Add video processing status tracking (queued → processing → ready)
3. Add video metadata extraction (duration, dimensions)
4. Add automatic thumbnail generation
5. Integrate video player error handling with fallback UI

### Phase 3 — AI Infrastructure

1. Add transcription pipeline (Whisper/Deepgram integration)
2. Add database tables for transcripts and video analysis
3. Add AI evaluation trigger endpoint
4. Implement multimodal LLM scoring with criterion-wise output
5. Implement confidence scoring
6. Implement flag generation (audio quality, compliance, language)
7. Populate `aiReviewJson` column with real data
8. Add `audit_logs` table

### Phase 4 — AI-Assisted Review UI

1. Enable AI Chat panel — connect to backend endpoint
2. Replace mock AI Review Analysis with real data
3. Add timestamp-grounded evidence display
4. Add AI confidence signal timeline with real segments
5. Add AI flag display (audio quality, compliance, language)
6. Add score comparison view (AI vs Human side-by-side)

### Phase 5 — Analytics & Reporting

1. Build real analytics API endpoints
2. Replace hardcoded SVG charts with real data
3. Add AI vs Human deviation tracking
4. Add evaluator consistency metrics
5. Add data export functionality

### Phase 6 — UX Polish

1. Add loading skeletons to all pages
2. Add empty states to all list views
3. Fix VideoPlayerCard title overflow
4. Make review detail tabs keyboard accessible
5. Normalize CSS variable usage across codebase
6. Add confirmation dialogs before destructive actions
7. Add "unsubmit/reopen" for finalized reviews

### Phase 7 — Nice to Have

1. Add rate limiting to API endpoints
2. Add `invite_tokens` table with expiring share links
3. Add user avatar upload
4. Add soft-delete (`isDeleted`) to users
5. Add project deadline/start/end date fields
6. Add organization logo and settings
7. Add granular permissions system to roles table
8. Configure CORS for production domains
9. Add structured logging to API routes
10. Add `rubric_scores` separate table for efficient querying

---

## 9. Quick Wins (Under 30 min each)

1. **Fix analytics page month** — Change hardcoded "Aug 1" dates to dynamic dates
2. **Remove w3schools video URL** — Replace sample video with proper placeholder
3. **Add `truncate` to VideoPlayerCard title** — One-line CSS fix
4. **Add `role="tablist"` to review detail tabs** — Accessibility improvement
5. **Remove localhost-only CORS restriction comment** — Add note to add production domains before deploy
6. **Add `aria-disabled` to AI chat input** — Already has `disabled`, make it explicitly accessible
7. **Remove `files` table from schema** — Orphaned/dead code
8. **Add `alt` text to all `<img>` tags** — Accessibility sweep

---

*End of Audit Report*
