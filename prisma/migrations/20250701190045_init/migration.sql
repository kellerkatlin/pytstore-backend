/*
  Warnings:

  - Made the column `taxType` on table `ProductItem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxType` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductItem" ALTER COLUMN "taxType" SET NOT NULL,
ALTER COLUMN "taxType" SET DEFAULT 'GRAVADO';

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "taxType" SET NOT NULL,
ALTER COLUMN "taxType" SET DEFAULT 'GRAVADO';
