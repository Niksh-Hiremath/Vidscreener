CREATE TABLE `organizations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_by` integer NOT NULL,
	`created_at` integer DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` integer DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `organization_id` integer REFERENCES organizations(id);