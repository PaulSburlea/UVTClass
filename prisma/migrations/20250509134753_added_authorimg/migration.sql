/*
  Warnings:

  - Made the column `authorName` on table `comment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `comment` ADD COLUMN `authorAvatar` VARCHAR(191) NULL,
    MODIFY `authorName` VARCHAR(191) NOT NULL;
