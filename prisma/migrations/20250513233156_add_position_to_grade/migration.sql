/*
  Warnings:

  - Added the required column `position` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `grade` ADD COLUMN `position` INTEGER NOT NULL;
