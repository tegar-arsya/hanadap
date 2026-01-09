import { describe, it, expect } from 'vitest';
import {
    parseBulanPembukuan,
    parseNilai,
    formatRupiah,
    isTransaksiMasuk,
    isTransaksiKeluar,
    JENIS_TRANSAKSI_MASUK,
    JENIS_TRANSAKSI_KELUAR
} from './transaksi';

describe('Transaksi Constants & Helpers', () => {

    describe('parseBulanPembukuan', () => {
        it('should parse valid Indonesian months correctly', () => {
            const year = 2026;

            // Test Februari
            const feb = parseBulanPembukuan('Februari', year);
            expect(feb).toBeInstanceOf(Date);
            expect(feb?.getFullYear()).toBe(year);
            expect(feb?.getMonth()).toBe(1); // 0-indexed, so 1 is February

            // Test Mei
            const mei = parseBulanPembukuan('Mei', year);
            expect(mei?.getMonth()).toBe(4);

            // Test case formatting
            const agustus = parseBulanPembukuan('agustus', year);
            expect(agustus?.getMonth()).toBe(7);
        });

        it('should return null for invalid months', () => {
            expect(parseBulanPembukuan('BulanTidakAda')).toBeNull();
            expect(parseBulanPembukuan('')).toBeNull();
        });

        it('should use current year if not specified', () => {
            const currentYear = new Date().getFullYear();
            const date = parseBulanPembukuan('Januari');
            expect(date?.getFullYear()).toBe(currentYear);
        });
    });

    describe('parseNilai', () => {
        it('should parse simple numbers', () => {
            expect(parseNilai(1000)).toBe(1000);
            expect(parseNilai('500')).toBe(500);
        });

        it('should parse formatted strings with dots', () => {
            expect(parseNilai('60.000')).toBe(60000);
            expect(parseNilai('1.250.000')).toBe(1250000);
        });

        it('should handle strings with commas as decimal (ID locale)', () => {
            // "10,500" in ID is 10.5 -> parsed as int becomes 10
            expect(parseNilai('10,500')).toBe(10);
        });

        it('should return 0 for invalid inputs', () => {
            expect(parseNilai('abc')).toBe(0);
        });
    });

    describe('formatRupiah', () => {
        // Note: Intl formatting might depend on system locale in Node environment,
        // but usually 'id-ID' works consistently in Node.
        it('should format simple numbers', () => {
            const result = formatRupiah(50000);
            expect(result).toContain('Rp');
            expect(result).toContain('50');
        });
    });

    describe('Type Checkers', () => {
        it('should identify incoming transactions', () => {
            expect(isTransaksiMasuk(JENIS_TRANSAKSI_MASUK.PEMBELIAN)).toBe(true);
            expect(isTransaksiMasuk(JENIS_TRANSAKSI_MASUK.HIBAH)).toBe(true);
            expect(isTransaksiMasuk('INVALID')).toBe(false);
        });

        it('should identify outgoing transactions', () => {
            expect(isTransaksiKeluar(JENIS_TRANSAKSI_KELUAR.PERMINTAAN)).toBe(true);
            expect(isTransaksiKeluar(JENIS_TRANSAKSI_KELUAR.RUSAK)).toBe(true);
            expect(isTransaksiKeluar('PEMBELIAN')).toBe(false);
        });
    });

});
