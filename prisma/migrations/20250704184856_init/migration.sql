-- CreateEnum
CREATE TYPE "CostOrigin" AS ENUM ('PURCHASE', 'SALE');

-- AlterTable
ALTER TABLE "ProductCostDetail" ADD COLUMN     "origin" "CostOrigin" NOT NULL DEFAULT 'PURCHASE';
