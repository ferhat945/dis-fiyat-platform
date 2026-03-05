-- AlterTable
ALTER TABLE `Lead`
  ADD COLUMN `clinicNote` TEXT NULL,
  ADD COLUMN `lastContactAt` DATETIME(3) NULL;