/*
  Warnings:

  - Added the required column `weight` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `grade` ADD COLUMN `weight` DOUBLE NOT NULL;
