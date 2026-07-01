/*
  Warnings:

  - A unique constraint covering the columns `[umkmId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "UMKMStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UMKMType" AS ENUM ('MIKRO', 'KECIL', 'MENENGAH');

-- CreateEnum
CREATE TYPE "UMKMCategory" AS ENUM ('PANGAN', 'FASHION', 'KERAJINAN', 'KOSMETIK', 'ELEKTRONIK', 'OTOMOTIF', 'KESEHATAN', 'JASA', 'PERTANIAN', 'PERIKANAN', 'LAINNYA');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'REVOKED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "umkmId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "umkmId" INTEGER;

-- CreateTable
CREATE TABLE "UMKM" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "type" "UMKMType" NOT NULL DEFAULT 'MIKRO',
    "category" "UMKMCategory" NOT NULL,
    "established" TIMESTAMP(3),
    "employees" INTEGER,
    "capital" DOUBLE PRECISION,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "status" "UMKMStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "website" TEXT,
    "socialMedia" JSONB,
    "tags" TEXT[],
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "umkmId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT,
    "issuer" TEXT NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'PENDING',
    "fileUrl" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMMember" (
    "id" SERIAL NOT NULL,
    "umkmId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMPost" (
    "id" SERIAL NOT NULL,
    "umkmId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMPartnership" (
    "id" SERIAL NOT NULL,
    "umkmId1" INTEGER NOT NULL,
    "umkmId2" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMPartnership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMProgram" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER,
    "registered" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "requirements" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UMKMProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UMKMProgramParticipant" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "umkmId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UMKMProgramParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UMKM_userId_key" ON "UMKM"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UMKM_slug_key" ON "UMKM"("slug");

-- CreateIndex
CREATE INDEX "Certification_umkmId_idx" ON "Certification"("umkmId");

-- CreateIndex
CREATE INDEX "Certification_status_idx" ON "Certification"("status");

-- CreateIndex
CREATE INDEX "UMKMMember_umkmId_idx" ON "UMKMMember"("umkmId");

-- CreateIndex
CREATE UNIQUE INDEX "UMKMMember_umkmId_userId_key" ON "UMKMMember"("umkmId", "userId");

-- CreateIndex
CREATE INDEX "UMKMPost_umkmId_idx" ON "UMKMPost"("umkmId");

-- CreateIndex
CREATE INDEX "UMKMPost_type_idx" ON "UMKMPost"("type");

-- CreateIndex
CREATE INDEX "UMKMPost_publishedAt_idx" ON "UMKMPost"("publishedAt");

-- CreateIndex
CREATE INDEX "UMKMPartnership_status_idx" ON "UMKMPartnership"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UMKMPartnership_umkmId1_umkmId2_key" ON "UMKMPartnership"("umkmId1", "umkmId2");

-- CreateIndex
CREATE UNIQUE INDEX "UMKMProgramParticipant_programId_umkmId_key" ON "UMKMProgramParticipant"("programId", "umkmId");

-- CreateIndex
CREATE UNIQUE INDEX "User_umkmId_key" ON "User"("umkmId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKM" ADD CONSTRAINT "UMKM_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMMember" ADD CONSTRAINT "UMKMMember_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMMember" ADD CONSTRAINT "UMKMMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMPost" ADD CONSTRAINT "UMKMPost_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMPost" ADD CONSTRAINT "UMKMPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMPartnership" ADD CONSTRAINT "UMKMPartnership_umkmId1_fkey" FOREIGN KEY ("umkmId1") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMPartnership" ADD CONSTRAINT "UMKMPartnership_umkmId2_fkey" FOREIGN KEY ("umkmId2") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMProgramParticipant" ADD CONSTRAINT "UMKMProgramParticipant_programId_fkey" FOREIGN KEY ("programId") REFERENCES "UMKMProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UMKMProgramParticipant" ADD CONSTRAINT "UMKMProgramParticipant_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "UMKM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
