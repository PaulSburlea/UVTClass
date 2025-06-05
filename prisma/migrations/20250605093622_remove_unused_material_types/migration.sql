/*
  Warnings:

  - The values [IMAGE,VIDEO,RAW] on the enum `material_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `material` MODIFY `type` ENUM('FILE', 'YOUTUBE', 'DRIVE', 'LINK') NOT NULL;
