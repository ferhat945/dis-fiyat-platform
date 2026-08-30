-- FCFS Lead Marketplace

-- leadId foreign key icin once normal index olustur.
CREATE INDEX `lead_assignments_leadId_idx`
  ON `lead_assignments`(`leadId`);

-- Eski yapida bir lead yalnizca bir kliniğe atanabiliyordu.
-- Artik ayni lead birden fazla klinik tarafindan satin alinabilir.
DROP INDEX `lead_assignments_leadId_key`
  ON `lead_assignments`;

CREATE UNIQUE INDEX `lead_assignments_leadId_clinicId_key`
  ON `lead_assignments`(`leadId`, `clinicId`);

CREATE INDEX `lead_assignments_clinicId_createdAt_idx`
  ON `lead_assignments`(`clinicId`, `createdAt`);

ALTER TABLE `lead`
  ADD COLUMN `unlockCount` INTEGER NOT NULL DEFAULT 0;

CREATE INDEX `lead_city_service_createdAt_idx`
  ON `lead`(`city`, `service`, `createdAt`);