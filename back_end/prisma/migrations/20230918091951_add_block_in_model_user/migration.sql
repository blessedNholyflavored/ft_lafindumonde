-- CreateTable
CREATE TABLE "_Block" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Block_AB_unique" ON "_Block"("A", "B");

-- CreateIndex
CREATE INDEX "_Block_B_index" ON "_Block"("B");

-- AddForeignKey
ALTER TABLE "_Block" ADD CONSTRAINT "_Block_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Block" ADD CONSTRAINT "_Block_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
