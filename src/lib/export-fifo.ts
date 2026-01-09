import * as XLSX from "xlsx";

/**
 * Export FIFO report to Excel
 * @param barangName - Name of the barang
 * @param satuan - Unit of the barang
 * @param report - FIFO report data
 * @returns Buffer containing the Excel file
 */
export function exportFIFOToExcel(
    barangName: string,
    satuan: string,
    report: Array<{
        tanggalMasuk: Date;
        jumlah: number;
        sisaJumlah: number;
        hargaSatuan: number;
        totalNilai: number;
        jenisTransaksi: string;
    }>
): Buffer {
    const worksheetData = [
        ["Tanggal Masuk", "Jumlah", "Sisa Jumlah", "Harga Satuan", "Total Nilai", "Jenis Transaksi"],
        ...report.map((row) => [
            row.tanggalMasuk.toISOString().split("T")[0],
            row.jumlah,
            row.sisaJumlah,
            row.hargaSatuan,
            row.totalNilai,
            row.jenisTransaksi,
        ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FIFO Report");

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}