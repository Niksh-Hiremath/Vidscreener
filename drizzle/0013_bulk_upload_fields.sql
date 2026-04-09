ALTER TABLE `project_form_submissions` ADD `external_id` text;--> statement-breakpoint
ALTER TABLE `project_form_submissions` ADD `source` text DEFAULT 'manual' NOT NULL;