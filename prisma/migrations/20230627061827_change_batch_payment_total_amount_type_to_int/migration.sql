/*
  Warnings:

  - You are about to alter the column `total_amount` on the `batch_payments` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "batch_payments" ALTER COLUMN "total_amount" SET DATA TYPE INTEGER;
