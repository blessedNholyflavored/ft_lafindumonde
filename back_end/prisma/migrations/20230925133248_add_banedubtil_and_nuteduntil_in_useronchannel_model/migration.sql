-- AlterTable
ALTER TABLE "UserOnChannel" ADD COLUMN     "bannedUntil" TIMESTAMP(3),
ADD COLUMN     "mutedUntil" TIMESTAMP(3);
