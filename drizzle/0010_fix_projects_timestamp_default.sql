UPDATE `projects`
SET `created_at` = CURRENT_TIMESTAMP
WHERE `created_at` = 'CURRENT_TIMESTAMP'
   OR `created_at` IS NULL
   OR trim(`created_at`) = '';
--> statement-breakpoint

UPDATE `projects`
SET `updated_at` = CURRENT_TIMESTAMP
WHERE `updated_at` = 'CURRENT_TIMESTAMP'
   OR `updated_at` IS NULL
   OR trim(`updated_at`) = '';
