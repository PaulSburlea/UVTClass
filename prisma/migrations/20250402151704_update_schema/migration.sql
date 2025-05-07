/*
  Warnings:

  - You are about to drop the `attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `attachment`;

-- DropTable
DROP TABLE `category`;

-- DropTable
DROP TABLE `course`;

-- CreateTable
CREATE TABLE `Classroom` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `section` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassroomStudent` (
    `id` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ClassroomStudent_classroomId_studentId_key`(`classroomId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Material` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `filePath` TEXT NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Material_classroomId_idx`(`classroomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
