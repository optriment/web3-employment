-- CreateTable
CREATE TABLE "batch_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_hash" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_payment_recipients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" UUID NOT NULL,
    "batch_payment_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_payment_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "batch_payments_transaction_hash_key" ON "batch_payments"("transaction_hash");

-- AddForeignKey
ALTER TABLE "batch_payments" ADD CONSTRAINT "batch_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_payment_recipients" ADD CONSTRAINT "batch_payment_recipients_batch_payment_id_fkey" FOREIGN KEY ("batch_payment_id") REFERENCES "batch_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
