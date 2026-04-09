# VidScreener Database Schema

The VidScreener database is built using Cloudflare D1 (SQLite) and managed via Drizzle ORM.

## Core Tables

### `organizations`
Represents the top-level entity in our multi-tenant system.
- **id**: Primary Key.
- **name**: Name of the organization.
- **createdBy**: User ID of the organization's superadmin.
- **createdAt**, **updatedAt**: Standard timestamps.

### `users`
All users within the system, including admins, evaluators, and submitters.
- **id**: Primary Key.
- **email**: Unique email address.
- **password**: Bcrypt-hashed password.
- **name**: Full name.
- **roleId**: References the `roles` table.
- **organizationId**: References the `organizations` table.

### `projects`
Individual evaluation projects owned by an organization.
- **id**: Primary Key.
- **organizationId**: References the parent organization.
- **name**: Name of the project.
- **description**: Detailed description.
- **status**: e.g., 'active', 'archived'.

### `roles`
System-defined roles (e.g., 'admin', 'evaluator', 'submitter').
- **id**: Primary Key.
- **name**: Unique role name.

---

## Project Configuration Tables

### `project_rubrics`
Custom evaluation criteria defined for each project.
- **projectId**: References the parent project.
- **title**: Rubric name (e.g., "Clarity").
- **description**: Guidelines for evaluators.
- **weight**: Weighting for scoring calculations.
- **sortOrder**: Display order in the UI.

### `project_forms`
Definition of the submission form for a project.
- **projectId**: References the parent project.
- **fieldsJson**: A JSON array containing the structure of the form fields.
- **allowedAttachmentTypes**: A JSON array specifying allowed file formats.

---

## Submission & Evaluation Tables

### `project_form_submissions`
Actual submissions from applicants.
- **id**: Primary Key.
- **projectId**: Parent project ID.
- **submitterUserId**: References the submitting user.
- **fieldsJson**: The applicant's response data in JSON format.
- **externalId**: (Optional) Used for mapping to external systems (e.g., Meritto).
- **source**: e.g., 'manual', 'meritto'.

### `project_form_submission_attachments`
Files (videos, PDFs) linked to a specific submission.
- **id**: Primary Key.
- **submissionId**: Parent submission ID.
- **r2Key**: The file's unique key in Cloudflare R2 storage.
- **fileName**, **fileSize**, **mimeType**: Metadata for the stored file.
- **reviewStatus**: Current status of the file (e.g., 'unassigned', 'assigned', 'reviewed').

### `project_video_reviews`
Detailed evaluation results for a video submission.
- **videoAttachmentId**: Unique reference to the attachment being reviewed.
- **evaluatorId**: References the person who performed the human review.
- **rubricBreakdownJson**: JSON data containing individual rubric scores.
- **aiReviewJson**: JSON data containing AI-generated evaluations and evidence.

---

## Utility Tables

### `project_evaluators`
Mapping between projects and the evaluators assigned to them.
- **projectId**, **evaluatorId**: Composite relationship.

### `project_form_shares`
Records of form distribution to potential submitters.
- **projectId**: The project being shared.
- **submitterEmail**: The recipient's email address.

### `password_reset_tokens`
Stores secure hashes for the password reset flow.
- **userId**: Target user.
- **tokenHash**: The hashed reset token.
- **expiresAt**: Token expiration timestamp.

---

## Schema Relationships Summary

1. **Organization-Level**: One `organization` contains many `users` and `projects`.
2. **Project-Level**: One `project` defines multiple `rubrics` and one `form`.
3. **Submission-Level**: One `project` can have many `submissions`, each with multiple `attachments`.
4. **Evaluation-Level**: An `attachment` (video) is linked to exactly one `video_review`, which stores both AI and Human scoring.
