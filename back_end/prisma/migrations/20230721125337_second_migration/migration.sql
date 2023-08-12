/*
  Warnings:

  - You are about to drop the column `hash` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "USER_STATUS" AS ENUM ('INGAME', 'OFFLINE', 'ONLINE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hash",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "status" "USER_STATUS" NOT NULL DEFAULT 'OFFLINE';

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
