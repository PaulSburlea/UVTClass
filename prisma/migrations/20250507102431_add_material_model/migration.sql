/*
  Warnings:

  - Added the required column `type` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `material` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `type` ENUM('FILE', 'YOUTUBE', 'DRIVE', 'LINK', 'TEXT') NOT NULL,
    ADD COLUMN `url` TEXT NULL,
    MODIFY `filePath` TEXT NULL;
