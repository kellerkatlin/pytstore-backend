/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[creationToken]` on the table `SellerRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CapitalType" AS ENUM ('INJECTION', 'PURCHASE_EXPENSE', 'OPERATIONAL_EXPENSE', 'SALE_PROFIT', 'DEVOLUTION_COST', 'WITHDRAWAL');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Seller" ALTER COLUMN "ruc" DROP NOT NULL,
ALTER COLUMN "businessName" DROP NOT NULL,
ALTER COLUMN "storeName" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "logoUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SellerRequest" ADD COLUMN     "creationToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastName" TEXT;

-- CreateTable
CREATE TABLE "CapitalTransaction" (
    "id" SERIAL NOT NULL,
    "type" "CapitalType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "referenceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapitalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SellerRequest_creationToken_key" ON "SellerRequest"("creationToken");
