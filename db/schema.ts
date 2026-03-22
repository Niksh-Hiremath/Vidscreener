import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

// Organization table
export const organizations = sqliteTable("organizations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  roleId: integer("role_id").notNull().references(() => roles.id),
  organizationId: integer("organization_id").references(() => organizations.id),
})

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  name: text("name")
})

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectRubrics = sqliteTable("project_rubrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  weight: integer("weight").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectForms = sqliteTable("project_forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id).unique(),
  fieldsJson: text("fields_json").notNull().default("[]"),
  allowedAttachmentTypes: text("allowed_attachment_types").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const evaluators = sqliteTable("evaluators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  userId: integer("user_id").references(() => users.id),
  email: text("email").notNull(),
  name: text("name"),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectEvaluators = sqliteTable("project_evaluators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  evaluatorId: integer("evaluator_id").notNull().references(() => evaluators.id),
  assignedAt: text("assigned_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectVideos = sqliteTable("project_videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("pending_review"),
  reviewedByEvaluatorId: integer("reviewed_by_evaluator_id").references(() => evaluators.id),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectFormSubmissions = sqliteTable("project_form_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  submitterUserId: integer("submitter_user_id").notNull().references(() => users.id),
  fieldsJson: text("fields_json").notNull().default("{}"),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectFormSubmissionAttachments = sqliteTable("project_form_submission_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  submissionId: integer("submission_id").notNull().references(() => projectFormSubmissions.id),
  formFieldKey: text("form_field_key"),
  r2Key: text("r2_key").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  attachmentType: text("attachment_type").notNull(),
  assignedEvaluatorId: integer("assigned_evaluator_id").references(() => evaluators.id),
  reviewStatus: text("review_status").notNull().default("unassigned"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectFormShares = sqliteTable("project_form_shares", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").notNull().references(() => projects.id),
  submitterEmail: text("submitter_email").notNull(),
  submitterUserId: integer("submitter_user_id").references(() => users.id),
  sharedByUserId: integer("shared_by_user_id").notNull().references(() => users.id),
  message: text("message"),
  sharedAt: text("shared_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectVideoReviews = sqliteTable("project_video_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  videoAttachmentId: integer("video_attachment_id").notNull().references(() => projectFormSubmissionAttachments.id).unique(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  evaluatorId: integer("evaluator_id").notNull().references(() => evaluators.id),
  rubricBreakdownJson: text("rubric_breakdown_json").notNull().default("[]"),
  aiReviewJson: text("ai_review_json"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
