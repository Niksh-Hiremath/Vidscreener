CREATE TABLE `password_reset_tokens` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `used_at` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
