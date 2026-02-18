/*
  Warnings:

  - Added the required column `city` to the `clinics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `clinics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `city` VARCHAR(64) NOT NULL,
    ADD COLUMN `instagramUrl` VARCHAR(255) NULL,
    ADD COLUMN `slug` VARCHAR(96) NOT NULL;
