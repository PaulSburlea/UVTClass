/*
  Warnings:

  - You are about to drop the column `teacherId` on the `classroom` table. All the data in the column will be lost.
  - You are about to drop the `classroomstudent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `classroom` DROP COLUMN `teacherId`,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `classroomstudent`;

-- CreateTable
CREATE TABLE `UserClassroom` (
    `id` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserClassroom_classroomId_userId_key`(`classroomId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
