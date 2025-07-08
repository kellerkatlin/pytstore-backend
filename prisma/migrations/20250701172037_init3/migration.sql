-- CreateEnum
CREATE TYPE "ReceiptType" AS ENUM ('TICKET', 'BOLETA', 'FACTURA');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "receiptType" "ReceiptType" NOT NULL DEFAULT 'TICKET';
