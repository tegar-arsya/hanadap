/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `Barang` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Barang" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "kategoriId" TEXT,
ADD COLUMN     "stokMinimum" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "alasanTolak" TEXT,
ADD COLUMN     "currentLevel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxLevel" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "StockBatch" ADD COLUMN     "tanggalExpiry" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "unitKerjaId" TEXT;

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitKerja" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "quotaBulanan" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnitKerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiLog" (
    "id" TEXT NOT NULL,
    "barangId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransaksiLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalLevel" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "roleRequired" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_nama_key" ON "Kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "UnitKerja_nama_key" ON "UnitKerja"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "UnitKerja_kode_key" ON "UnitKerja"("kode");

-- CreateIndex
CREATE INDEX "TransaksiLog_barangId_idx" ON "TransaksiLog"("barangId");

-- CreateIndex
CREATE INDEX "TransaksiLog_createdAt_idx" ON "TransaksiLog"("createdAt");

-- CreateIndex
CREATE INDEX "Notifikasi_userId_dibaca_idx" ON "Notifikasi"("userId", "dibaca");

-- CreateIndex
CREATE UNIQUE INDEX "Barang_barcode_key" ON "Barang"("barcode");

-- CreateIndex
CREATE INDEX "StockBatch_tanggalExpiry_idx" ON "StockBatch"("tanggalExpiry");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unitKerjaId_fkey" FOREIGN KEY ("unitKerjaId") REFERENCES "UnitKerja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiLog" ADD CONSTRAINT "TransaksiLog_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiLog" ADD CONSTRAINT "TransaksiLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
