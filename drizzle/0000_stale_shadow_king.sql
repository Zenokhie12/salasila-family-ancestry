CREATE TABLE `family_units` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_ids` text NOT NULL,
	`parent_roles` text,
	`child_ids` text NOT NULL,
	`marriage_date` text,
	`marriage_place` text
);
--> statement-breakpoint
CREATE TABLE `media_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`person_id` text NOT NULL,
	`type` text NOT NULL,
	`uri` text,
	`caption` text,
	`text_content` text,
	`duration_ms` integer,
	`mime_type` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_media_person` ON `media_attachments` (`person_id`);--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`date_of_birth` text,
	`place_of_birth` text,
	`current_address` text,
	`is_deceased` integer,
	`date_of_death` text,
	`place_of_death` text,
	`is_root` integer,
	`lineage` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
