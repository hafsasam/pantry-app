/*
  Warnings:

  - A unique constraint covering the columns `[user_id,ingredient_id]` on the table `pantry_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `pantry_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "pantry_items_ingredient_id_key";

-- AlterTable
ALTER TABLE "pantry_items" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "pantry_items_ingredient_id_idx" ON "pantry_items"("ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "pantry_items_user_id_ingredient_id_key" ON "pantry_items"("user_id", "ingredient_id");

-- AddForeignKey
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
