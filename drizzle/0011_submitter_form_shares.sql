-- Add form shares table: admin shares a form with submitters via email
CREATE TABLE IF NOT EXISTS `project_form_shares` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `project_id` integer NOT NULL REFERENCES `projects`(`id`),
  `submitter_email` text NOT NULL,
  `submitter_user_id` integer REFERENCES `users`(`id`),
  `shared_by_user_id` integer NOT NULL REFERENCES `users`(`id`),
  `message` text,
  `shared_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
