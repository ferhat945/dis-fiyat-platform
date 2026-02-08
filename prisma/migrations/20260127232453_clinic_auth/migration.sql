/*
  Warnings:

  - Made the column `email` on table `clinics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passwordHash` on table `clinics` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `clinics` MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `passwordHash` VARCHAR(191) NOT NULL;
