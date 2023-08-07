/*
  Warnings:

  - Made the column `pictureURL` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "pictureURL" SET NOT NULL;