-- CreateTable
CREATE TABLE "batch_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_hash" TEXT NOT NULL,
    "recipients_count" INTEGER NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "group_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batch_payments_transaction_hash_key" ON "batch_payments"("transaction_hash");

-- AddForeignKey
ALTER TABLE "batch_payments" ADD CONSTRAINT "batch_payments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
