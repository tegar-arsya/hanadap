import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma'; // This will be mocked via setup or directly here if needed

// Mock prisma methods
vi.mock('@/lib/prisma', () => ({
    prisma: {
        barang: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        stockBatch: {
            create: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}));

// Mock XLSX
vi.mock('xlsx', () => ({
    read: vi.fn(),
    utils: {
        sheet_to_json: vi.fn(),
    },
    SheetNames: ['Sheet1'],
    Sheets: { 'Sheet1': {} }
}));

// Mock Activity Logger
vi.mock('@/lib/activity-logger', () => ({
    logActivity: vi.fn(),
}));

import { POST } from '@/app/api/import-pembelian/route';

describe('API Import Pembelian', () => {

    // Clear mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if no file is uploaded', async () => {
        const formData = new FormData(); // Empty
        const req = {
            formData: () => Promise.resolve(formData),
            url: 'http://localhost/api/import-pembelian'
        } as any;

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toContain('File tidak ditemukan');
    });

    it('should process excel data correctly', async () => {
        // 1. Setup Mock Excel Data
        const mockRow = {
            "Bulan Pembukuan di SAKTI": "Februari",
            "Jenis Transaksi": "Pembelian",
            "Nama Barang": "Pensil 2B",
            "Jumlah Barang": 100,
            "Harga Satuan": 5000
        };

        // Mock XLSX behaviors
        (XLSX.read as any).mockReturnValue({
            SheetNames: ['Sheet1'],
            Sheets: { 'Sheet1': {} }
        });
        (XLSX.utils.sheet_to_json as any).mockReturnValue([mockRow]);

        // 2. Setup Mock Database behaviors
        // Barang not found, so it should be created
        (prisma.barang.findFirst as any).mockResolvedValue(null);
        (prisma.barang.create as any).mockResolvedValue({
            id: 'new-barang-id',
            nama: 'Pensil 2B',
            stokTotal: 0
        });
        (prisma.stockBatch.create as any).mockResolvedValue({ id: 'batch-id' });
        (prisma.barang.update as any).mockResolvedValue({});

        // 3. Create Request
        const formData = new FormData();
        const file = new File(['dummy content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // Mock arrayBuffer manually as JSDOM File might not implement it fully or correctly for this test context without polyfills
        Object.defineProperty(file, 'arrayBuffer', {
            value: () => Promise.resolve(new ArrayBuffer(8))
        });

        formData.append('file', file);
        formData.append('tahun', '2026');

        const req = {
            formData: () => Promise.resolve(formData),
            url: 'http://localhost/api/import-pembelian'
        } as any;

        // 4. Execute
        const res = await POST(req);
        const data = await res.json();

        // 5. Assertions
        expect(data.summary.success).toBe(1);
        expect(data.summary.newItems).toBe(1);

        // Ensure Prisma was called correctly
        expect(prisma.barang.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                nama: 'Pensil 2B'
            })
        }));

        expect(prisma.stockBatch.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                jumlah: 100,
                hargaSatuan: 5000,
                jenisTransaksi: 'PEMBELIAN'
            })
        }));
    });

    it('should handle existing barang correctly', async () => {
        // Mock Input
        const mockRow = {
            "Nama Barang": "Kertas A4",
            "Jumlah Barang": 50,
            "Harga Satuan": 40000
        };
        (XLSX.read as any).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: {} });
        (XLSX.utils.sheet_to_json as any).mockReturnValue([mockRow]);

        // Mock DB: Barang exists
        (prisma.barang.findFirst as any).mockResolvedValue({
            id: 'existing-id',
            nama: 'Kertas A4',
            stokTotal: 20
        });

        // Create Request
        const formData = new FormData();
        const file = new File([''], 'test.xlsx');
        Object.defineProperty(file, 'arrayBuffer', {
            value: () => Promise.resolve(new ArrayBuffer(8))
        });
        formData.append('file', file);

        const req = {
            formData: () => Promise.resolve(formData),
            url: 'http://localhost/api/import-pembelian'
        } as any;

        await POST(req);

        // Assert: Should NOT create new barang, but SHOULD create batch
        expect(prisma.barang.create).not.toHaveBeenCalled();
        expect(prisma.stockBatch.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                barangId: 'existing-id',
                jumlah: 50
            })
        }));
        // Update total stok
        expect(prisma.barang.update).toHaveBeenCalled();
    });
});
