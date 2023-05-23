-- AlterTable
ALTER TABLE "groups" RENAME CONSTRAINT "companies_pkey" TO "groups_pkey";

-- AlterTable
ALTER TABLE "recipients" RENAME CONSTRAINT "employees_pkey" TO "recipients_pkey";
