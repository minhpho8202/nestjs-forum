/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;
