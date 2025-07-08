/*
  Warnings:

  - You are about to drop the column `valueId` on the `ProductAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `CategoryAttribute` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryAttribute" DROP CONSTRAINT "CategoryAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryAttribute" DROP CONSTRAINT "CategoryAttribute_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductAttribute" DROP CONSTRAINT "ProductAttribute_valueId_fkey";

-- AlterTable
ALTER TABLE "ProductAttribute" DROP COLUMN "valueId";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "isActive",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "CategoryAttribute";

-- CreateTable
CREATE TABLE "ProductItemAttribute" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "valueId" INTEGER NOT NULL,

    CONSTRAINT "ProductItemAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAttributeValue" (
    "id" SERIAL NOT NULL,
    "productAttributeId" INTEGER NOT NULL,
    "valueId" INTEGER NOT NULL,

    CONSTRAINT "ProductAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductItemAttribute_itemId_attributeId_key" ON "ProductItemAttribute"("itemId", "attributeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttributeValue_productAttributeId_valueId_key" ON "ProductAttributeValue"("productAttributeId", "valueId");

-- AddForeignKey
ALTER TABLE "ProductItemAttribute" ADD CONSTRAINT "ProductItemAttribute_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ProductItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItemAttribute" ADD CONSTRAINT "ProductItemAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItemAttribute" ADD CONSTRAINT "ProductItemAttribute_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "AttributeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_productAttributeId_fkey" FOREIGN KEY ("productAttributeId") REFERENCES "ProductAttribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAttributeValue" ADD CONSTRAINT "ProductAttributeValue_valueId_fkey" FOREIGN KEY ("valueId") REFERENCES "AttributeValue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
