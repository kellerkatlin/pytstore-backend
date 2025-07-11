-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "documentUrl" TEXT;

-- AlterTable
ALTER TABLE "PurchaseItem" ADD COLUMN     "variantId" INTEGER;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
