ALTER TABLE `project_forms` ADD `allowed_attachment_types` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint

CREATE TABLE `project_form_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`submitter_user_id` integer NOT NULL,
	`fields_json` text DEFAULT '{}' NOT NULL,
	`submitted_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitter_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_form_submissions_project_id_idx` ON `project_form_submissions` (`project_id`);
--> statement-breakpoint

CREATE TABLE `project_form_submission_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` integer NOT NULL,
	`r2_key` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`attachment_type` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `project_form_submissions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_form_submission_attachments_submission_id_idx` ON `project_form_submission_attachments` (`submission_id`);
