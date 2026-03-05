-- AlterTable
ALTER TABLE `BlogPost` ADD COLUMN `clinicId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `clinics` ADD COLUMN `trialEndsAt` DATETIME(3) NULL,
    ADD COLUMN `trialUsedAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `payment_logs` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `status` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NULL,
    `providerRef` VARCHAR(191) NULL,
    `payload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_logs_clinicId_createdAt_idx`(`clinicId`, `createdAt`),
    INDEX `payment_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `BlogPost_clinicId_idx` ON `BlogPost`(`clinicId`);

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_logs` ADD CONSTRAINT `payment_logs_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
