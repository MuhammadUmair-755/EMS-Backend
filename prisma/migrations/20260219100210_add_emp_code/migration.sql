/*
  Warnings:

  - A unique constraint covering the columns `[empCode]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Made the column `reason` on table `Leave` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "empCode" TEXT;

-- AlterTable
ALTER TABLE "Leave" ALTER COLUMN "reason" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_empCode_key" ON "Employee"("empCode");
