-- CreateTable
CREATE TABLE `clinic_price_ranges` (
    `id` VARCHAR(191) NOT NULL,
    `clinicId` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `minPrice` INTEGER NOT NULL,
    `maxPrice` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `clinic_price_ranges_clinicId_idx`(`clinicId`),
    INDEX `clinic_price_ranges_city_service_idx`(`city`, `service`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clinic_price_ranges` ADD CONSTRAINT `clinic_price_ranges_clinicId_fkey` FOREIGN KEY (`clinicId`) REFERENCES `clinics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
