-- AlterTable
ALTER TABLE "batch_payment_recipients" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "recipients" ALTER COLUMN "salary" SET DATA TYPE BIGINT;
