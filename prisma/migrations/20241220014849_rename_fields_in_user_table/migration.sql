/*
  Warnings:

  - You are about to drop the column `active` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `UserNotification` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('NORMAL', 'GOOGLE', 'FACEBOOK', 'X', 'GITHUB');

-- DropIndex
DROP INDEX "User_googleId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "active",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "active",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "active",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "active",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "active",
DROP COLUMN "googleId",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "provider" "UserType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "socialId" TEXT;

-- AlterTable
ALTER TABLE "UserNotification" DROP COLUMN "active",
ADD COLUMN     "isActived" BOOLEAN NOT NULL DEFAULT true;
