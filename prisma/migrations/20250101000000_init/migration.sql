-- CreateEnum
CREATE TYPE "IssueScreenshot_type" AS ENUM ('image/png', 'image/jpeg', 'image/gif', 'image/webp');

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "severity" TEXT DEFAULT 'medium',
    "status" TEXT DEFAULT 'open',
    "type" TEXT DEFAULT 'bug',
    "screen" TEXT NOT NULL,
    "stepsToReproduce" TEXT DEFAULT '[]',
    "expectedBehavior" TEXT DEFAULT '',
    "actualBehavior" TEXT DEFAULT '',
    "environment" TEXT DEFAULT 'Production',
    "device" TEXT DEFAULT '',
    "osVersion" TEXT DEFAULT '',
    "appVersion" TEXT DEFAULT '',
    "reportedBy" TEXT DEFAULT '',
    "assignedTo" TEXT DEFAULT '',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueScreenshot" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IssueScreenshot_issueId_idx" ON "IssueScreenshot"("issueId");

-- AddForeignKey
ALTER TABLE "IssueScreenshot" ADD CONSTRAINT "IssueScreenshot_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
