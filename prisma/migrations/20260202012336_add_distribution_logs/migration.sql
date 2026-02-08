-- CreateTable
CREATE TABLE `lead_distribution_logs` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `assigned` BOOLEAN NOT NULL DEFAULT false,
    `reason` VARCHAR(191) NOT NULL,
    `details` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lead_distribution_logs_leadId_idx`(`leadId`),
    INDEX `lead_distribution_logs_clinicId_idx`(`clinicId`),
    INDEX `lead_distribution_logs_city_service_idx`(`city`, `service`),
    INDEX `lead_distribution_logs_assigned_idx`(`assigned`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lead_distribution_logs` ADD CONSTRAINT `lead_distribution_logs_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_distribution_logs` ADD CONSTRAINT `lead_distribution_logs_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
