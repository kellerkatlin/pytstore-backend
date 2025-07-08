/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ruc]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('NATURAL', 'JURIDICAL');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "customerType" "CustomerType" NOT NULL DEFAULT 'NATURAL',
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "ruc" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_dni_key" ON "Customer"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_ruc_key" ON "Customer"("ruc");
