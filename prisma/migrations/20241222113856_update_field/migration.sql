/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Community` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Community" DROP CONSTRAINT "Community_creatorId_fkey";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "creatorId";

-- CreateTable
CREATE TABLE "_CommunityMemberships" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CommunityMemberships_AB_unique" ON "_CommunityMemberships"("A", "B");

-- CreateIndex
CREATE INDEX "_CommunityMemberships_B_index" ON "_CommunityMemberships"("B");

-- AddForeignKey
ALTER TABLE "_CommunityMemberships" ADD CONSTRAINT "_CommunityMemberships_A_fkey" FOREIGN KEY ("A") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityMemberships" ADD CONSTRAINT "_CommunityMemberships_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
