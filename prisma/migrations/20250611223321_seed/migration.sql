/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `ProductItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,categoryId]` on the table `Attribute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[expenseId]` on the table `CapitalTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountId` to the `CapitalTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceType` to the `CapitalTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CapitalAccountName" AS ENUM ('CASH', 'INVENTORY', 'PROFITS', 'COMMISSIONS');

-- CreateEnum
CREATE TYPE "CapitalSourceType" AS ENUM ('SALE', 'PURCHASE', 'RETURN', 'SHIPMENT', 'EXPENSE', 'WITHDRAWAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('SALARY', 'MARKETING', 'PLATFORM', 'RENT', 'LOGISTICS', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CapitalType" ADD VALUE 'TRANSFER_IN';
ALTER TYPE "CapitalType" ADD VALUE 'TRANSFER_OUT';

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "CapitalTransaction" ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD COLUMN     "expenseId" INTEGER,
ADD COLUMN     "referenceType" "CapitalSourceType" NOT NULL;

-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "ProductItem" DROP COLUMN "imageUrl",
ADD COLUMN     "purchaseItemId" INTEGER;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "variantId" INTEGER;

-- CreateTable
CREATE TABLE "ProductItemImage" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProductItemImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "type" "ExpenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "capitalTransactionId" INTEGER,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapitalAccount" (
    "id" SERIAL NOT NULL,
    "name" "CapitalAccountName" NOT NULL,
    "description" TEXT,

    CONSTRAINT "CapitalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductItemImage_itemId_imageUrl_key" ON "ProductItemImage"("itemId", "imageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_capitalTransactionId_key" ON "Expense"("capitalTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "CapitalAccount_name_key" ON "CapitalAccount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Attribute_name_categoryId_key" ON "Attribute"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CapitalTransaction_expenseId_key" ON "CapitalTransaction"("expenseId");

-- AddForeignKey
ALTER TABLE "ProductItem" ADD CONSTRAINT "ProductItem_purchaseItemId_fkey" FOREIGN KEY ("purchaseItemId") REFERENCES "PurchaseItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductItemImage" ADD CONSTRAINT "ProductItemImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ProductItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapitalTransaction" ADD CONSTRAINT "CapitalTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CapitalAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_capitalTransactionId_fkey" FOREIGN KEY ("capitalTransactionId") REFERENCES "CapitalTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
