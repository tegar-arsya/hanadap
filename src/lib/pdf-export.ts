"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Column {
    header: string;
    dataKey: string;
}

interface ExportPDFParams {
    title: string;
    columns: Column[];
    data: Record<string, unknown>[];
    filename?: string;
}

export function exportToPDF({ title, columns, data, filename }: ExportPDFParams) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dibuat: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

    // Table
    autoTable(doc, {
        startY: 28,
        head: [columns.map((c) => c.header)],
        body: data.map((row) => columns.map((c) => String(row[c.dataKey] ?? "-"))),
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Halaman ${i} dari ${pageCount} - Hanadap Inventory System`,
            14,
            doc.internal.pageSize.height - 10
        );
    }

    // Download
    doc.save(filename || `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`);
}

// Pre-configured exports
export const pdfExports = {
    stok: (data: Record<string, unknown>[]) => {
        exportToPDF({
            title: "Laporan Stok Barang",
            columns: [
                { header: "Nama Barang", dataKey: "nama" },
                { header: "Kategori", dataKey: "kategori" },
                { header: "Satuan", dataKey: "satuan" },
                { header: "Stok", dataKey: "stokTotal" },
                { header: "Min. Stok", dataKey: "stokMinimum" },
            ],
            data,
            filename: `laporan_stok_${new Date().toISOString().split("T")[0]}.pdf`,
        });
    },

    transaksi: (data: Record<string, unknown>[]) => {
        exportToPDF({
            title: "Riwayat Transaksi",
            columns: [
                { header: "Tanggal", dataKey: "tanggal" },
                { header: "Barang", dataKey: "barang" },
                { header: "Tipe", dataKey: "tipe" },
                { header: "Jumlah", dataKey: "jumlah" },
                { header: "User", dataKey: "user" },
            ],
            data,
            filename: `laporan_transaksi_${new Date().toISOString().split("T")[0]}.pdf`,
        });
    },

    fifo: (data: Record<string, unknown>[]) => {
        exportToPDF({
            title: "Laporan Batch FIFO",
            columns: [
                { header: "Barang", dataKey: "barang" },
                { header: "Tgl Masuk", dataKey: "tanggalMasuk" },
                { header: "Jumlah Awal", dataKey: "jumlah" },
                { header: "Sisa", dataKey: "sisaJumlah" },
                { header: "Expiry", dataKey: "tanggalExpiry" },
            ],
            data,
            filename: `laporan_fifo_${new Date().toISOString().split("T")[0]}.pdf`,
        });
    },

    expiry: (data: Record<string, unknown>[]) => {
        exportToPDF({
            title: "Laporan Barang Kadaluarsa",
            columns: [
                { header: "Barang", dataKey: "barang" },
                { header: "Tgl Expiry", dataKey: "tanggalExpiry" },
                { header: "Sisa Stok", dataKey: "sisaJumlah" },
            ],
            data,
            filename: `laporan_expiry_${new Date().toISOString().split("T")[0]}.pdf`,
        });
    },
};
