CREATE TABLE `todos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`desc` text NOT NULL,
	`completed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `todos_id` PRIMARY KEY(`id`)
);
