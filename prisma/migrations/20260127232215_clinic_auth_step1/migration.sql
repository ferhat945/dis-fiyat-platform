/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `clinics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `passwordHash` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `clinics_email_key` ON `clinics`(`email`);
