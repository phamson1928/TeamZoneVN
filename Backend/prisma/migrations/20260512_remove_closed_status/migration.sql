-- Xoá các zone CLOSED trước khi alter enum
DELETE FROM "Zone" WHERE status = 'CLOSED';

-- Drop default constraint trước khi alter type
ALTER TABLE "Zone" ALTER COLUMN status DROP DEFAULT;

-- Tạo lại enum ZoneStatus không có CLOSED
ALTER TYPE "ZoneStatus" RENAME TO "ZoneStatus_old";
CREATE TYPE "ZoneStatus" AS ENUM ('OPEN', 'FULL');
ALTER TABLE "Zone" ALTER COLUMN status TYPE "ZoneStatus" USING status::text::"ZoneStatus";
DROP TYPE "ZoneStatus_old";

-- Restore default
ALTER TABLE "Zone" ALTER COLUMN status SET DEFAULT 'OPEN';
