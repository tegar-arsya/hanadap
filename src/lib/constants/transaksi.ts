/**
 * Konstanta Jenis Transaksi untuk Sistem Inventori BPS
 * Sesuai dengan standar akuntansi pemerintah (SAP)
 */

// ============================================
// JENIS TRANSAKSI MASUK (Barang Masuk ke Gudang)
// ============================================
export const JENIS_TRANSAKSI_MASUK = {
    PEMBELIAN: "PEMBELIAN",           // Pengadaan via UP/LS/GU
    HIBAH: "HIBAH",                   // Terima dari pihak lain
    TRANSFER_MASUK: "TRANSFER_MASUK", // Dari BPS Pusat/Provinsi lain
    SALDO_AWAL: "SALDO_AWAL",         // Migrasi data awal
    KOREKSI_TAMBAH: "KOREKSI_TAMBAH", // Penyesuaian audit
} as const;

// ============================================
// JENIS TRANSAKSI KELUAR (Barang Keluar dari Gudang)
// ============================================
export const JENIS_TRANSAKSI_KELUAR = {
    PERMINTAAN: "PERMINTAAN",           // Request dari unit kerja
    TRANSFER_KELUAR: "TRANSFER_KELUAR", // Kirim ke BPS lain
    RUSAK: "RUSAK",                     // Barang rusak/hilang
    KOREKSI_KURANG: "KOREKSI_KURANG",   // Penyesuaian audit
    RETURN: "RETURN",                   // Barang dikembalikan supplier
} as const;

// Type definitions
export type JenisTransaksiMasuk = typeof JENIS_TRANSAKSI_MASUK[keyof typeof JENIS_TRANSAKSI_MASUK];
export type JenisTransaksiKeluar = typeof JENIS_TRANSAKSI_KELUAR[keyof typeof JENIS_TRANSAKSI_KELUAR];
export type JenisTransaksi = JenisTransaksiMasuk | JenisTransaksiKeluar;

// ============================================
// Label untuk UI (Bahasa Indonesia)
// ============================================
export const LABEL_TRANSAKSI_MASUK: Record<JenisTransaksiMasuk, string> = {
    PEMBELIAN: "Pembelian",
    HIBAH: "Hibah",
    TRANSFER_MASUK: "Transfer Masuk",
    SALDO_AWAL: "Saldo Awal",
    KOREKSI_TAMBAH: "Koreksi Tambah",
};

export const LABEL_TRANSAKSI_KELUAR: Record<JenisTransaksiKeluar, string> = {
    PERMINTAAN: "Permintaan",
    TRANSFER_KELUAR: "Transfer Keluar",
    RUSAK: "Rusak/Hilang",
    KOREKSI_KURANG: "Koreksi Kurang",
    RETURN: "Pengembalian",
};

// Combined labels
export const LABEL_TRANSAKSI: Record<JenisTransaksi, string> = {
    ...LABEL_TRANSAKSI_MASUK,
    ...LABEL_TRANSAKSI_KELUAR,
};

// ============================================
// Helper untuk cek tipe transaksi
// ============================================
export function isTransaksiMasuk(jenis: string): jenis is JenisTransaksiMasuk {
    return Object.values(JENIS_TRANSAKSI_MASUK).includes(jenis as JenisTransaksiMasuk);
}

export function isTransaksiKeluar(jenis: string): jenis is JenisTransaksiKeluar {
    return Object.values(JENIS_TRANSAKSI_KELUAR).includes(jenis as JenisTransaksiKeluar);
}

// ============================================
// Mapping Bulan Indonesia ke Angka (untuk import)
// ============================================
export const BULAN_MAP: Record<string, number> = {
    "januari": 1,
    "februari": 2,
    "maret": 3,
    "april": 4,
    "mei": 5,
    "juni": 6,
    "juli": 7,
    "agustus": 8,
    "september": 9,
    "oktober": 10,
    "november": 11,
    "desember": 12,
};

/**
 * Parse bulan pembukuan dari format SAKTI ke Date
 * @param bulan - Nama bulan dalam bahasa Indonesia (misal: "Februari", "Mei")
 * @param tahun - Tahun (default: tahun saat ini)
 * @returns Date object atau null jika tidak valid
 */
export function parseBulanPembukuan(bulan: string, tahun?: number): Date | null {
    const bulanLower = bulan.toLowerCase().trim();
    const bulanNum = BULAN_MAP[bulanLower];

    if (!bulanNum) {
        return null;
    }

    const year = tahun || new Date().getFullYear();
    // Set ke tanggal 1 dari bulan tersebut
    return new Date(year, bulanNum - 1, 1);
}

/**
 * Format angka ke format Rupiah
 */
export function formatRupiah(nilai: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(nilai);
}

/**
 * Parse nilai dari string (hapus titik sebagai separator ribuan)
 * Contoh: "60.000" -> 60000
 */
export function parseNilai(nilai: string | number): number {
    if (typeof nilai === "number") {
        return nilai;
    }
    // Hapus titik (separator ribuan) dan parse
    const cleaned = nilai.replace(/\./g, "").replace(/,/g, ".");
    return parseInt(cleaned) || 0;
}
