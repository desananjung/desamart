-- CreateEnum
CREATE TYPE "EnterpriseRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('UMKM', 'KOPERASI', 'TOKO', 'DISTRIBUTOR', 'MANUFAKTUR', 'JASA', 'LAINNYA');

-- CreateTable
CREATE TABLE "Enterprise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "BusinessType" NOT NULL DEFAULT 'UMKM',
    "logo" TEXT,
    "banner" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enterprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseStore" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseMember" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "EnterpriseRole" NOT NULL DEFAULT 'STAFF',
    "permissions" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseProduct" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseOrder" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseIntegration" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnterpriseAnalytic" (
    "id" SERIAL NOT NULL,
    "enterpriseId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orders" INTEGER NOT NULL DEFAULT 0,
    "products" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "conversion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topProducts" JSONB,
    "topStores" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnterpriseAnalytic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_slug_key" ON "Enterprise"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Enterprise_ownerId_key" ON "Enterprise"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseStore_enterpriseId_storeId_key" ON "EnterpriseStore"("enterpriseId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseMember_enterpriseId_userId_key" ON "EnterpriseMember"("enterpriseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseProduct_enterpriseId_productId_key" ON "EnterpriseProduct"("enterpriseId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "EnterpriseOrder_enterpriseId_orderId_key" ON "EnterpriseOrder"("enterpriseId", "orderId");

-- CreateIndex
CREATE INDEX "EnterpriseAnalytic_enterpriseId_date_idx" ON "EnterpriseAnalytic"("enterpriseId", "date");

-- AddForeignKey
ALTER TABLE "Enterprise" ADD CONSTRAINT "Enterprise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseStore" ADD CONSTRAINT "EnterpriseStore_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseStore" ADD CONSTRAINT "EnterpriseStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseMember" ADD CONSTRAINT "EnterpriseMember_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseMember" ADD CONSTRAINT "EnterpriseMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseProduct" ADD CONSTRAINT "EnterpriseProduct_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseProduct" ADD CONSTRAINT "EnterpriseProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseOrder" ADD CONSTRAINT "EnterpriseOrder_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseOrder" ADD CONSTRAINT "EnterpriseOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseIntegration" ADD CONSTRAINT "EnterpriseIntegration_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnterpriseAnalytic" ADD CONSTRAINT "EnterpriseAnalytic_enterpriseId_fkey" FOREIGN KEY ("enterpriseId") REFERENCES "Enterprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
