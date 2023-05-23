/*
  Warnings:

  - Made the column `user_id` on table `groups` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
