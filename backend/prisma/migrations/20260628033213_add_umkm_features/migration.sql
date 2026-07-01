/*
  Warnings:

  - You are about to drop the column `umkmId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `banner` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `capital` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `employees` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `established` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `totalProducts` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `totalRevenue` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `totalReviews` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `totalSales` on the `UMKM` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `UMKM` table. All the data in the column will be lost.
  - The `status` column on the `UMKM` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `umkmId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Certification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UMKMMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UMKMPartnership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UMKMPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UMKMProgram` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UMKMProgramParticipant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `UMKM` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UMKM` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `UMKM` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `UMKM` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `address` on table `UMKM` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `UMKM` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Certification" DROP CONSTRAINT "Certification_umkmId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_umkmId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMMember" DROP CONSTRAINT "UMKMMember_umkmId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMMember" DROP CONSTRAINT "UMKMMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMPartnership" DROP CONSTRAINT "UMKMPartnership_umkmId1_fkey";

-- DropForeignKey
ALTER TABLE "UMKMPartnership" DROP CONSTRAINT "UMKMPartnership_umkmId2_fkey";

-- DropForeignKey
ALTER TABLE "UMKMPost" DROP CONSTRAINT "UMKMPost_umkmId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMPost" DROP CONSTRAINT "UMKMPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMProgramParticipant" DROP CONSTRAINT "UMKMProgramParticipant_programId_fkey";

-- DropForeignKey
ALTER TABLE "UMKMProgramParticipant" DROP CONSTRAINT "UMKMProgramParticipant_umkmId_fkey";

-- DropIndex
DROP INDEX "UMKM_slug_key";

-- DropIndex
DROP INDEX "User_umkmId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "umkmId";

-- AlterTable
ALTER TABLE "UMKM" DROP COLUMN "banner",
DROP COLUMN "capital",
DROP COLUMN "city",
DROP COLUMN "employees",
DROP COLUMN "established",
DROP COLUMN "logo",
DROP COLUMN "postalCode",
DROP COLUMN "province",
DROP COLUMN "rating",
DROP COLUMN "slug",
DROP COLUMN "tags",
DROP COLUMN "totalProducts",
DROP COLUMN "totalRevenue",
DROP COLUMN "totalReviews",
DROP COLUMN "totalSales",
DROP COLUMN "type",
ADD COLUMN     "businessLicense" TEXT,
ADD COLUMN     "certificate" TEXT,
ADD COLUMN     "certificateId" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "idCard" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "storeId" INTEGER NOT NULL,
ADD COLUMN     "subCategory" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "umkmId";

-- DropTable
DROP TABLE "Certification";

-- DropTable
DROP TABLE "UMKMMember";

-- DropTable
DROP TABLE "UMKMPartnership";

-- DropTable
DROP TABLE "UMKMPost";

-- DropTable
DROP TABLE "UMKMProgram";

-- DropTable
DROP TABLE "UMKMProgramParticipant";

-- DropEnum
DROP TYPE "CertificationStatus";

-- DropEnum
DROP TYPE "UMKMCategory";

-- DropEnum
DROP TYPE "UMKMStatus";

-- DropEnum
DROP TYPE "UMKMType";

-- CreateTable
CREATE TABLE "UMKMProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "umkmId" INTEGER NOT NULL,
    "productionDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "batchNumber" TEXT,
    "halal" BOOLEAN NOT NULL DEFAULT false,
    "organic" BOOLEAN NOT NULL DEFAULT false,
    "bpom" BOOLEAN NOT NULL DEFAULT false,
    "bpomNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER,
    "umkmId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUsage" INTEGER NOT NULL DEFAULT -1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMCommunity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialRecord" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "umkmId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UMKM_storeId_key" ON "UMKM"("storeId");

-- AddForeignKey
ALTER TABLE "UMKM" ADD CONSTRAINT "UMKM_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMProduct" ADD CONSTRAINT "UMKMProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMProduct" ADD CONSTRAINT "UMKMProduct_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMCommunity" ADD CONSTRAINT "UMKMCommunity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMComment" ADD CONSTRAINT "UMKMComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMComment" ADD CONSTRAINT "UMKMComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "UMKMCommunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMComment" ADD CONSTRAINT "UMKMComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "UMKMComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialRecord" ADD CONSTRAINT "FinancialRecord_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
