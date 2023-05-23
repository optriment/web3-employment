-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "recipients" DROP CONSTRAINT "recipients_group_id_fkey";

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
