-- CreateEnum
CREATE TYPE "UserChannelVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'PWD_PROTECTED');

-- CreateEnum
CREATE TYPE "UserRoleInChannel" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "UserStatusOnChannel" AS ENUM ('CLEAN', 'MUTE', 'BAN');

-- CreateTable
CREATE TABLE "Chatroom" (
    "id" SERIAL NOT NULL,
    "visibility" "UserChannelVisibility" NOT NULL DEFAULT 'PUBLIC',
    "name" TEXT NOT NULL,
    "hash" TEXT,

    CONSTRAINT "Chatroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnChannel" (
    "id" SERIAL NOT NULL,
    "role" "UserRoleInChannel" NOT NULL DEFAULT 'USER',
    "status" "UserStatusOnChannel" NOT NULL DEFAULT 'CLEAN',
    "userId" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,

    CONSTRAINT "UserOnChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserOnChannel_channelId_userId_key" ON "UserOnChannel"("channelId", "userId");

-- AddForeignKey
ALTER TABLE "UserOnChannel" ADD CONSTRAINT "UserOnChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnChannel" ADD CONSTRAINT "UserOnChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
