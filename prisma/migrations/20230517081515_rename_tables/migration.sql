ALTER TABLE "employees" DROP CONSTRAINT "employees_company_id_fkey";

ALTER TABLE "payments" DROP CONSTRAINT "payments_employee_id_fkey";

ALTER TABLE "payments" RENAME COLUMN "employee_id" TO "recipient_id";

ALTER TABLE "employees" RENAME COLUMN "company_id" TO "group_id";

ALTER TABLE "companies" RENAME TO "groups";

ALTER TABLE "employees" RENAME TO "recipients";

ALTER TABLE "recipients" ADD CONSTRAINT "recipients_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
