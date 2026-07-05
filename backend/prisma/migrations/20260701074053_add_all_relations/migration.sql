-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "villageId" INTEGER;

-- AlterTable
ALTER TABLE "UMKM" ADD COLUMN     "villageId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "villageId" INTEGER;

-- CreateTable
CREATE TABLE "VillageEconomy" (
    "id" SERIAL NOT NULL,
    "villageId" INTEGER NOT NULL,
    "totalUMKM" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTransactions" INTEGER NOT NULL DEFAULT 0,
    "growthRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "topProducts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VillageEconomy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "regency" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "population" INTEGER,
    "area" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalReward" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'PEMULA',
    "localPurchases" INTEGER NOT NULL DEFAULT 0,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "localPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VillageLogistics" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "pickupVillageId" INTEGER NOT NULL,
    "deliveryVillageId" INTEGER NOT NULL,
    "courierId" INTEGER,
    "distance" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VillageLogistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VillageEconomy_villageId_month_year_key" ON "VillageEconomy"("villageId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "LocalReward_userId_key" ON "LocalReward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VillageLogistics_orderId_key" ON "VillageLogistics"("orderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKM" ADD CONSTRAINT "UMKM_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageEconomy" ADD CONSTRAINT "VillageEconomy_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalReward" ADD CONSTRAINT "LocalReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageLogistics" ADD CONSTRAINT "VillageLogistics_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageLogistics" ADD CONSTRAINT "VillageLogistics_pickupVillageId_fkey" FOREIGN KEY ("pickupVillageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageLogistics" ADD CONSTRAINT "VillageLogistics_deliveryVillageId_fkey" FOREIGN KEY ("deliveryVillageId") REFERENCES "Village"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VillageLogistics" ADD CONSTRAINT "VillageLogistics_courierId_fkey" FOREIGN KEY ("courierId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
