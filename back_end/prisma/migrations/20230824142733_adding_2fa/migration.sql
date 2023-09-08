-- AlterTable
ALTER TABLE "User" ADD COLUMN     "enabled2FA" BOOLEAN,
ADD COLUMN     "totpKey" TEXT;
