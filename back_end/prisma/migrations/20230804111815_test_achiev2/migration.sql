/*
  Warnings:

  - You are about to drop the `Friendship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Friends` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_A_fkey";

-- DropForeignKey
ALTER TABLE "_Friends" DROP CONSTRAINT "_Friends_B_fkey";

-- DropTable
DROP TABLE "Friendship";

-- DropTable
DROP TABLE "_Friends";
