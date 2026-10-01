CREATE TABLE `captains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phone` varchar(32),
	`vehiclePlate` varchar(32),
	`availability` enum('available','busy','offline') NOT NULL DEFAULT 'offline',
	`rating` varchar(8) NOT NULL DEFAULT '5.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `captains_id` PRIMARY KEY(`id`),
	CONSTRAINT `captains_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(32) NOT NULL,
	`customerId` int,
	`captainId` int,
	`status` enum('new','preparing','ready','assigned','in_transit','delivered','cancelled') NOT NULL DEFAULT 'new',
	`customerName` varchar(160) NOT NULL,
	`deliveryAddress` text NOT NULL,
	`total` varchar(32) NOT NULL,
	`items` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','captain') NOT NULL DEFAULT 'user';