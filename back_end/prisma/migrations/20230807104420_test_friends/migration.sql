/*
  Warnings:

  - You are about to drop the `Friends` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `achievements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId1_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_userId2_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropTable
DROP TABLE "Friends";

-- DropTable
DROP TABLE "UserAchievement";

-- DropTable
DROP TABLE "achievements";

-- CreateTable
CREATE TABLE "_Friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Friends_AB_unique" ON "_Friends"("A", "B");

-- CreateIndex
CREATE INDEX "_Friends_B_index" ON "_Friends"("B");

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
