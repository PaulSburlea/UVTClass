/*
  Warnings:

  - You are about to drop the column `content` on the `post` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `post` DROP COLUMN `content`,
    DROP COLUMN `title`;

-- CreateIndex
CREATE INDEX `Classroom_userId_idx` ON `Classroom`(`userId`);

-- CreateIndex
CREATE INDEX `UserClassroom_userId_idx` ON `UserClassroom`(`userId`);

-- CreateIndex
CREATE INDEX `UserClassroom_classroomId_idx` ON `UserClassroom`(`classroomId`);
