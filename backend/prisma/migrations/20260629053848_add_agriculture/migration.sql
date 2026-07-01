-- CreateEnum
CREATE TYPE "CommodityCategory" AS ENUM ('PADI', 'JAGUNG', 'KEDELAI', 'SAYURAN', 'BUAH', 'PALAWIJA', 'PERKEBUNAN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "CommodityQuality" AS ENUM ('PREMIUM', 'STANDAR', 'EKONOMI', 'AFKIR');

-- CreateEnum
CREATE TYPE "HarvestStatus" AS ENUM ('TANAM', 'TUMBUH', 'PANEN', 'SELESAI');

-- CreateTable
CREATE TABLE "Farm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "farmerId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmCommodity" (
    "id" SERIAL NOT NULL,
    "farmId" INTEGER NOT NULL,
    "commodity" TEXT NOT NULL,
    "category" "CommodityCategory" NOT NULL DEFAULT 'SAYURAN',
    "variety" TEXT,
    "plantingDate" TIMESTAMP(3) NOT NULL,
    "harvestEstimate" TIMESTAMP(3) NOT NULL,
    "areaPlanted" DOUBLE PRECISION NOT NULL,
    "quantityEstimate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmCommodity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Harvest" (
    "id" SERIAL NOT NULL,
    "farmId" INTEGER NOT NULL,
    "commodityId" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "quality" "CommodityQuality" NOT NULL DEFAULT 'STANDAR',
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "status" "HarvestStatus" NOT NULL DEFAULT 'PANEN',
    "isAggregated" BOOLEAN NOT NULL DEFAULT false,
    "aggregatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Harvest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketPrice" (
    "id" SERIAL NOT NULL,
    "commodity" TEXT NOT NULL,
    "category" "CommodityCategory" NOT NULL DEFAULT 'SAYURAN',
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "quality" "CommodityQuality" NOT NULL DEFAULT 'STANDAR',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonInfo" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "prediction" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "recommendedCommodity" TEXT,
    "tips" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmOrder" (
    "id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "commodity" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "targetPrice" DOUBLE PRECISION,
    "targetQuality" "CommodityQuality" NOT NULL DEFAULT 'STANDAR',
    "harvestDate" TIMESTAMP(3),
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmLogistics" (
    "id" SERIAL NOT NULL,
    "farmId" INTEGER NOT NULL,
    "harvestId" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "transport" TEXT NOT NULL,
    "logisticsFee" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmLogistics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmCommodity" ADD CONSTRAINT "FarmCommodity_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harvest" ADD CONSTRAINT "Harvest_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "FarmCommodity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmOrder" ADD CONSTRAINT "FarmOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmLogistics" ADD CONSTRAINT "FarmLogistics_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmLogistics" ADD CONSTRAINT "FarmLogistics_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "Harvest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
