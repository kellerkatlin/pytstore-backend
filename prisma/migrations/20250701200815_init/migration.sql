/*
  Warnings:

  - Added the required column `gainType` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gainValue` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gainType` to the `ProductItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gainValue` to the `ProductItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "gainType" "CommissionType" NOT NULL,
ADD COLUMN     "gainValue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "ProductItem" ADD COLUMN     "gainType" "CommissionType" NOT NULL,
ADD COLUMN     "gainValue" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "salePrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "gainType" "CommissionType",
ADD COLUMN     "gainValue" DOUBLE PRECISION;
