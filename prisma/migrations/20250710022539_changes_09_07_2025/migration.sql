-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "documentUrl" TEXT;
