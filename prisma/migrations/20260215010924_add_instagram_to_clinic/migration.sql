/*
  Warnings:

  - You are about to drop the column `city` on the `clinics` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `clinics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clinics` DROP COLUMN `city`,
    DROP COLUMN `slug`;
