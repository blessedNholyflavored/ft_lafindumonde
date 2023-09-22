-- CreateEnum
CREATE TYPE "InvitationsStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ChatroomInvitations" (
    "id" SERIAL NOT NULL,
    "status" "InvitationsStatus" NOT NULL DEFAULT 'PENDING',
    "chatroomId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatroomInvitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatroomInvitations_chatroomId_senderId_receiverId_key" ON "ChatroomInvitations"("chatroomId", "senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "ChatroomInvitations" ADD CONSTRAINT "ChatroomInvitations_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomInvitations" ADD CONSTRAINT "ChatroomInvitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatroomInvitations" ADD CONSTRAINT "ChatroomInvitations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
