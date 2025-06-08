/*
  Warnings:

  - You are about to drop the column `clientId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `CartSession` table. All the data in the column will be lost.
  - The `status` column on the `Commission` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `clientId` on the `ProductReview` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Wishlist` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClientActivityLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `CartSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialCode]` on the table `ProductItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entity` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `discountType` on the `Coupon` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entityType` on the `EntityChangeLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `changeType` on the `EntityChangeLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sourceType` on the `InventoryMovement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `direction` on the `InventoryMovement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `LoginAttempt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `commissionType` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `ProductCostDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customerId` to the `ProductReview` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `discountType` on the `Promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `appliesTo` on the `Promotion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `PurchaseItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `resolution` on the `Return` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `name` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customerId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Sale` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `shippingMethodId` to the `Shipment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `shippingType` on the `Shipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `paidBy` on the `Shipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Shipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `provider` on the `UserProvider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `customerId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `WithdrawalRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('SUPERADMIN', 'ADMIN', 'SELLER', 'RECRUITER', 'STOCK', 'MARKETING');

-- CreateEnum
CREATE TYPE "SellerRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISABLED', 'DELETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "InventoryMovementDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "InventoryMovementSourceType" AS ENUM ('PURCHASE', 'SALE', 'ADJUSTMENT', 'RETURN');

-- CreateEnum
CREATE TYPE "CostDetailType" AS ENUM ('SHIPPING', 'TAX', 'ADDITIONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PurchaseItemStatus" AS ENUM ('PENDING', 'RECEIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SalesStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SaleType" AS ENUM ('REGULAR', 'PREORDER');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('STANDARD', 'EXPRESS', 'LOCAL');

-- CreateEnum
CREATE TYPE "ShippingPayer" AS ENUM ('CUSTOMER', 'COMPANY', 'SELLER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('COMPLETED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENT', 'AMOUNT');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('CATEGORY', 'PRODUCT', 'BRAND', 'SELLER');

-- CreateEnum
CREATE TYPE "ReturnResolution" AS ENUM ('REFUND', 'REPLACEMENT', 'CREDIT', 'NONE');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('SALE', 'PRODUCT', 'USER', 'SELLER', 'COUPON');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'REGISTER', 'SALE_COMPLETED');

-- CreateEnum
CREATE TYPE "LoginAttemptStatus" AS ENUM ('SUCCESS', 'FAIL');

-- CreateEnum
CREATE TYPE "UserProviderType" AS ENUM ('GOOGLE', 'FACEBOOK', 'GITHUB', 'TWITTER', 'APPLE');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_clientId_fkey";

-- DropForeignKey
ALTER TABLE "CartSession" DROP CONSTRAINT "CartSession_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientActivityLog" DROP CONSTRAINT "ClientActivityLog_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ProductReview" DROP CONSTRAINT "ProductReview_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wishlist" DROP CONSTRAINT "Wishlist_clientId_fkey";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT,
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL,
DROP COLUMN "entity",
ADD COLUMN     "entity" "EntityType" NOT NULL;

-- AlterTable
ALTER TABLE "CartSession" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER;

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "status",
ADD COLUMN     "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "CouponType" NOT NULL;

-- AlterTable
ALTER TABLE "EntityChangeLog" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "EntityType" NOT NULL,
DROP COLUMN "changeType",
ADD COLUMN     "changeType" "AuditAction" NOT NULL;

-- AlterTable
ALTER TABLE "InventoryMovement" DROP COLUMN "sourceType",
ADD COLUMN     "sourceType" "InventoryMovementSourceType" NOT NULL,
DROP COLUMN "direction",
ADD COLUMN     "direction" "InventoryMovementDirection" NOT NULL;

-- AlterTable
ALTER TABLE "LoginAttempt" DROP COLUMN "status",
ADD COLUMN     "status" "LoginAttemptStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "commissionType",
ADD COLUMN     "commissionType" "CommissionType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ProductCostDetail" DROP COLUMN "type",
ADD COLUMN     "type" "CostDetailType" NOT NULL;

-- AlterTable
ALTER TABLE "ProductReview" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "discountType",
ADD COLUMN     "discountType" "CouponType" NOT NULL,
DROP COLUMN "appliesTo",
ADD COLUMN     "appliesTo" "PromotionType" NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseItemStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Return" DROP COLUMN "resolution",
ADD COLUMN     "resolution" "ReturnResolution" NOT NULL;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "name",
ADD COLUMN     "name" "RoleName" NOT NULL;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER NOT NULL,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "SalesStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "type",
ADD COLUMN     "type" "SaleType" NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "shippingMethodId" INTEGER NOT NULL,
DROP COLUMN "shippingType",
ADD COLUMN     "shippingType" "ShippingType" NOT NULL,
DROP COLUMN "paidBy",
ADD COLUMN     "paidBy" "ShippingPayer" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ShipmentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recoveryExpires" TIMESTAMP(3),
ADD COLUMN     "recoveryToken" TEXT;

-- AlterTable
ALTER TABLE "UserProvider" DROP COLUMN "provider",
ADD COLUMN     "provider" "UserProviderType" NOT NULL;

-- AlterTable
ALTER TABLE "Wishlist" DROP COLUMN "clientId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "WithdrawalRequest" DROP COLUMN "status",
ADD COLUMN     "status" "WithdrawalStatus" NOT NULL;

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "ClientActivityLog";

-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "Seller" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ruc" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerRequest" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "message" TEXT,
    "status" "SellerRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "SellerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "isTemporaryPassword" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerActivityLog" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPriceHistory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "changedBy" INTEGER,

    CONSTRAINT "ProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingMethod" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_ruc_key" ON "Seller"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "SellerRequest_email_key" ON "SellerRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SellerRequest_phone_key" ON "SellerRequest"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "CartSession_sessionToken_key" ON "CartSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "ProductItem_serialCode_key" ON "ProductItem"("serialCode");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerActivityLog" ADD CONSTRAINT "CustomerActivityLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceHistory" ADD CONSTRAINT "ProductPriceHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES "ShippingMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartSession" ADD CONSTRAINT "CartSession_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
