-- CreateTable
CREATE TABLE "privateMessage" (
    "id" SERIAL NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,

    CONSTRAINT "privateMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "privateMessage" ADD CONSTRAINT "privateMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "privateMessage" ADD CONSTRAINT "privateMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
