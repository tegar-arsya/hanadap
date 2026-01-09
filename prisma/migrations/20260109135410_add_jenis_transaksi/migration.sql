-- AlterTable
ALTER TABLE "StockBatch" ADD COLUMN     "jenisTransaksi" TEXT NOT NULL DEFAULT 'PEMBELIAN',
ADD COLUMN     "keterangan" TEXT;

-- CreateIndex
CREATE INDEX "StockBatch_jenisTransaksi_idx" ON "StockBatch"("jenisTransaksi");
