CREATE TABLE `project_video_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_attachment_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`evaluator_id` integer NOT NULL,
	`rubric_breakdown_json` text DEFAULT '[]' NOT NULL,
	`ai_review_json` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`video_attachment_id`) REFERENCES `project_form_submission_attachments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluator_id`) REFERENCES `evaluators`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_video_reviews_video_attachment_id_unique` ON `project_video_reviews` (`video_attachment_id`);
--> statement-breakpoint
CREATE INDEX `project_video_reviews_project_id_idx` ON `project_video_reviews` (`project_id`);
