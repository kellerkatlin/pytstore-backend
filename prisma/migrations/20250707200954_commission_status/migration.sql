-- AlterEnum
ALTER TYPE "CommissionStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
