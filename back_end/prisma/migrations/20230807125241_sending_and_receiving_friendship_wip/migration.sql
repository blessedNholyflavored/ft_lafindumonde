-- CreateEnum
CREATE TYPE "FriendsInvitationStatus" AS ENUM ('ACCEPTED', 'PENDING', 'REFUSED');

-- CreateTable
CREATE TABLE "Friends" (
    "id" SERIAL NOT NULL,
    "status" "FriendsInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,

    CONSTRAINT "Friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friends_senderId_recipientId_key" ON "Friends"("senderId", "recipientId");

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
