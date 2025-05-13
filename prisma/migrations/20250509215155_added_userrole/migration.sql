/*
  Warnings:

  - Added the required column `role` to the `UserClassroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `userclassroom` 
ADD COLUMN `role` ENUM('TEACHER', 'STUDENT') NOT NULL DEFAULT 'STUDENT';
