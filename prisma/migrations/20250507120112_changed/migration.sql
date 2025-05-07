/*
  Warnings:

  - You are about to drop the column `classroomId` on the `material` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `material` table. All the data in the column will be lost.
  - The values [TEXT] on the enum `Material_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `Material_classroomId_idx` ON `material`;

-- AlterTable
ALTER TABLE `material` DROP COLUMN `classroomId`,
    DROP COLUMN `description`,
    ADD COLUMN `postId` VARCHAR(191) NULL,
    MODIFY `type` ENUM('FILE', 'YOUTUBE', 'DRIVE', 'LINK') NOT NULL;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Post_classroomId_idx`(`classroomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Material_postId_idx` ON `Material`(`postId`);
