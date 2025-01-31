/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "downvotes",
DROP COLUMN "upvotes",
ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0;
