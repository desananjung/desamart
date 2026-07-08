/*
  Warnings:

  - You are about to drop the `VillageLogistics` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'CANCELLED', 'REFUNDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'WAITING_PAYMENT';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_VERIFIED';
ALTER TYPE "OrderStatus" ADD VALUE 'READY_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "OrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

-- DropForeignKey
ALTER TABLE "VillageLogistics" DROP CONSTRAINT "VillageLogistics_courierId_fkey";

-- DropForeignKey
ALTER TABLE "VillageLogistics" DROP CONSTRAINT "VillageLogistics_deliveryVillageId_fkey";

-- DropForeignKey
ALTER TABLE "VillageLogistics" DROP CONSTRAINT "VillageLogistics_orderId_fkey";

-- DropForeignKey
ALTER TABLE "VillageLogistics" DROP CONSTRAINT "VillageLogistics_pickupVillageId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderNumber" TEXT,
ALTER COLUMN "paymentStatus" SET DEFAULT 'UNPAID';

-- DropTable
DROP TABLE "VillageLogistics";

-- CreateTable
CREATE TABLE "village_couriers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "pricePerKm" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "village_couriers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
