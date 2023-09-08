-- DropIndex
DROP INDEX "Game_userId1_key";

-- DropIndex
DROP INDEX "Game_userId2_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "User_id_seq";
