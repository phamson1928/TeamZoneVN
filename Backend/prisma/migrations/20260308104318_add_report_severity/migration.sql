-- CreateEnum
CREATE TYPE "ReportSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "severity" "ReportSeverity" NOT NULL DEFAULT 'MEDIUM';
