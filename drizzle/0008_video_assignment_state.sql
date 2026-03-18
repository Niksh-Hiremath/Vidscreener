ALTER TABLE `project_form_submission_attachments` ADD `assigned_evaluator_id` integer REFERENCES evaluators(id);
--> statement-breakpoint
ALTER TABLE `project_form_submission_attachments` ADD `review_status` text DEFAULT 'unassigned' NOT NULL;
--> statement-breakpoint
ALTER TABLE `project_form_submission_attachments` ADD `reviewed_at` text;
--> statement-breakpoint
CREATE INDEX `project_form_submission_attachments_assigned_eval_idx`
ON `project_form_submission_attachments` (`assigned_evaluator_id`);
--> statement-breakpoint
CREATE INDEX `project_form_submission_attachments_review_status_idx`
ON `project_form_submission_attachments` (`review_status`);
