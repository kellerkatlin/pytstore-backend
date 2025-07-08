/*
  Warnings:

  - Added the required column `igvAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaxAffectationType" AS ENUM ('GRAVADO', 'INAFECTO', 'EXONERADO');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "taxType" "TaxAffectationType" NOT NULL DEFAULT 'GRAVADO';

-- AlterTable
ALTER TABLE "ProductItem" ADD COLUMN     "taxType" "TaxAffectationType";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "taxType" "TaxAffectationType";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "igvAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL;
