-- AlterTable
ALTER TABLE "ProductCostDetail" ADD COLUMN     "saleId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProductCostDetail" ADD CONSTRAINT "ProductCostDetail_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
