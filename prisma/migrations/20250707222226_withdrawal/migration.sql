-- DropForeignKey
ALTER TABLE "CapitalTransaction" DROP CONSTRAINT "CapitalTransaction_accountId_fkey";

-- AlterTable
ALTER TABLE "CapitalTransaction" ALTER COLUMN "accountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CapitalTransaction" ADD CONSTRAINT "CapitalTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CapitalAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
