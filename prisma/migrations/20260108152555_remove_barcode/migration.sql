/*
  Warnings:

  - You are about to drop the column `barcode` on the `Barang` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Barang_barcode_key";

-- AlterTable
ALTER TABLE "Barang" DROP COLUMN "barcode";
