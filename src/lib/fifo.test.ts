import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { tambahStok, kurangiStokFIFO } from './fifo';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        barang: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        stockBatch: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

describe('FIFO Logic', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('tambahStok', () => {
        it('should create new batch and increment total stock', async () => {
            const barangId = 'barang-1';
            const jumlah = 10;
            const options = {
                hargaSatuan: 5000,
                jenisTransaksi: 'PEMBELIAN'
            };

            await tambahStok(barangId, jumlah, options);

            // Verify batch creation
            expect(prisma.stockBatch.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    barangId,
                    jumlah,
                    sisaJumlah: jumlah,
                    hargaSatuan: 5000
                })
            }));

            // Verify total stock update
            expect(prisma.barang.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: barangId },
                data: { stokTotal: { increment: jumlah } }
            }));
        });
    });

    describe('kurangiStokFIFO', () => {
        it('should fail if stock is insufficient', async () => {
            (prisma.barang.findUnique as any).mockResolvedValue({
                id: 'barang-1',
                stokTotal: 5 // Only 5 available
            });

            const result = await kurangiStokFIFO('barang-1', 10); // Request 10

            expect(result).toBe(false);
            expect(prisma.stockBatch.update).not.toHaveBeenCalled();
        });

        it('should reduce from oldest batch first (FIFO)', async () => {
            const barangId = 'barang-1';
            const requestQty = 7;

            // Mock Barang
            (prisma.barang.findUnique as any).mockResolvedValue({
                id: barangId,
                stokTotal: 20
            });

            // Mock Batches (Batch 1: 5 items, Batch 2: 10 items)
            // Should take 5 from Batch 1, and 2 from Batch 2
            const mockBatches = [
                { id: 'batch-1', sisaJumlah: 5, tanggalMasuk: new Date('2026-01-01') },
                { id: 'batch-2', sisaJumlah: 10, tanggalMasuk: new Date('2026-02-01') },
            ];

            (prisma.stockBatch.findMany as any).mockResolvedValue(mockBatches);

            // Execute
            const result = await kurangiStokFIFO(barangId, requestQty);

            expect(result).toBe(true);

            // Verify batch 1 (fully used)
            expect(prisma.stockBatch.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'batch-1' },
                data: { sisaJumlah: 0 } // 5 - 5
            }));

            // Verify batch 2 (partially used)
            expect(prisma.stockBatch.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'batch-2' },
                data: { sisaJumlah: 8 } // 10 - 2
            }));

            // Verify total stock update
            expect(prisma.barang.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: barangId },
                data: { stokTotal: 20 - requestQty }
            }));
        });
    });

});
