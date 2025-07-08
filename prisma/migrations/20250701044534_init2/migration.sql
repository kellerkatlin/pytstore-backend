/*
  Warnings:

  - You are about to drop the column `phone` on the `Seller` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Seller_phone_key";

-- AlterTable
ALTER TABLE "Seller" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
