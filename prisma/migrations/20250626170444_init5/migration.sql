/*
  Warnings:

  - You are about to drop the column `batteryHealth` on the `ProductItem` table. All the data in the column will be lost.
  - You are about to drop the column `condition` on the `ProductItem` table. All the data in the column will be lost.
  - You are about to drop the column `functionality` on the `ProductItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductItem" DROP COLUMN "batteryHealth",
DROP COLUMN "condition",
DROP COLUMN "functionality";
