/*
  Warnings:

  - The values [PROFITS] on the enum `CapitalAccountName` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CapitalAccountName_new" AS ENUM ('CASH', 'INVENTORY', 'COMMISSIONS');
ALTER TABLE "CapitalAccount" ALTER COLUMN "name" TYPE "CapitalAccountName_new" USING ("name"::text::"CapitalAccountName_new");
ALTER TYPE "CapitalAccountName" RENAME TO "CapitalAccountName_old";
ALTER TYPE "CapitalAccountName_new" RENAME TO "CapitalAccountName";
DROP TYPE "CapitalAccountName_old";
COMMIT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
