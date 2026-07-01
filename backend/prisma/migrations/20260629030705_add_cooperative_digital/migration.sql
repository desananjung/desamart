-- CreateEnum
CREATE TYPE "CooperativeDigitalType" AS ENUM ('KUD', 'KSP', 'KPRI', 'KOPKAR', 'LAINNYA');

-- CreateEnum
CREATE TYPE "CooperativeDigitalStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CooperativeDigitalLoanStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID', 'OVERDUE', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "CooperativeDigitalTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'LOAN_DISBURSEMENT', 'LOAN_PAYMENT', 'SHU_DISTRIBUTION', 'TRANSFER', 'SERVICE_FEE', 'PENALTY');

-- CreateTable
CREATE TABLE "CooperativeDigital" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CooperativeDigitalType" NOT NULL DEFAULT 'KUD',
    "description" TEXT,
    "registrationNumber" TEXT NOT NULL,
    "establishmentDate" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "website" TEXT,
    "certificateUrl" TEXT,
    "logo" TEXT,
    "banner" TEXT,
    "status" "CooperativeDigitalStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" INTEGER,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalMember" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "memberNumber" TEXT NOT NULL,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mandatorySavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "voluntarySavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLoan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingLoan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accumulatedSHU" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "distributedSHU" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalProduct" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "memberDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalSavings" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalSavings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalLoan" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tenure" INTEGER NOT NULL,
    "purpose" TEXT,
    "status" "CooperativeDigitalLoanStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "disbursedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "installmentAmount" DOUBLE PRECISION NOT NULL,
    "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lateDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalLoanPayment" (
    "id" SERIAL NOT NULL,
    "loanId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalLoanPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalTransaction" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "memberId" INTEGER,
    "type" "CooperativeDigitalTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "toMemberId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalMeeting" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "onlineLink" TEXT,
    "hasVoting" BOOLEAN NOT NULL DEFAULT false,
    "votingResults" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalVote" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "anggotaId" INTEGER NOT NULL,
    "choice" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooperativeDigitalAnnouncement" (
    "id" SERIAL NOT NULL,
    "cooperativeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "targetRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CooperativeDigitalAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeDigital_slug_key" ON "CooperativeDigital"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeDigital_adminId_key" ON "CooperativeDigital"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeDigitalMember_memberNumber_key" ON "CooperativeDigitalMember"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CooperativeDigitalVote_meetingId_anggotaId_key" ON "CooperativeDigitalVote"("meetingId", "anggotaId");

-- AddForeignKey
ALTER TABLE "CooperativeDigital" ADD CONSTRAINT "CooperativeDigital_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalMember" ADD CONSTRAINT "CooperativeDigitalMember_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalMember" ADD CONSTRAINT "CooperativeDigitalMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalProduct" ADD CONSTRAINT "CooperativeDigitalProduct_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalProduct" ADD CONSTRAINT "CooperativeDigitalProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalSavings" ADD CONSTRAINT "CooperativeDigitalSavings_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalSavings" ADD CONSTRAINT "CooperativeDigitalSavings_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CooperativeDigitalMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalLoan" ADD CONSTRAINT "CooperativeDigitalLoan_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalLoan" ADD CONSTRAINT "CooperativeDigitalLoan_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CooperativeDigitalMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalLoanPayment" ADD CONSTRAINT "CooperativeDigitalLoanPayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "CooperativeDigitalLoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalTransaction" ADD CONSTRAINT "CooperativeDigitalTransaction_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalTransaction" ADD CONSTRAINT "CooperativeDigitalTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CooperativeDigitalMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalTransaction" ADD CONSTRAINT "CooperativeDigitalTransaction_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "CooperativeDigitalMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalMeeting" ADD CONSTRAINT "CooperativeDigitalMeeting_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalVote" ADD CONSTRAINT "CooperativeDigitalVote_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "CooperativeDigitalMeeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalVote" ADD CONSTRAINT "CooperativeDigitalVote_anggotaId_fkey" FOREIGN KEY ("anggotaId") REFERENCES "CooperativeDigitalMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooperativeDigitalAnnouncement" ADD CONSTRAINT "CooperativeDigitalAnnouncement_cooperativeId_fkey" FOREIGN KEY ("cooperativeId") REFERENCES "CooperativeDigital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
