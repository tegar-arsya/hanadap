import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { LABEL_TRANSAKSI } from "@/lib/constants/transaksi";

// GET - Export FIFO report to Excel
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const barangId = searchParams.get("barangId");

        if (!barangId) {
            return NextResponse.json(
                { error: "Barang ID harus disediakan" },
                { status: 400 }
            );
        }

        // Fetch barang and its stock batches
        const barang = await prisma.barang.findUnique({
            where: { id: barangId },
            include: {
                batches: {
                    orderBy: { tanggalMasuk: "asc" },
                },
            },
        });

        if (!barang) {
            return NextResponse.json(
                { error: "Barang tidak ditemukan" },
                { status: 404 }
            );
        }

        // Calculate totals
        const totalJumlah = barang.batches.reduce((sum, b) => sum + b.jumlah, 0);
        const totalSisa = barang.batches.reduce((sum, b) => sum + b.sisaJumlah, 0);
        const totalNilai = barang.batches.reduce(
            (sum, b) => sum + b.sisaJumlah * b.hargaSatuan,
            0
        );

        // Create worksheet data
        const worksheetData = [
            // Header info
            ["KARTU STOK BARANG (METODE FIFO)"],
            [""],
            ["Nama Barang:", barang.nama],
            ["Satuan:", barang.satuan],
            ["Tanggal Cetak:", new Date().toLocaleDateString("id-ID")],
            [""],
            // Table header
            [
                "No",
                "Tanggal Masuk",
                "Jenis Transaksi",
                "Jumlah Awal",
                "Sisa Stok",
                "Harga Satuan",
                "Total Nilai",
                "Keterangan",
            ],
            // Data rows
            ...barang.batches.map((batch, idx) => [
                idx + 1,
                new Date(batch.tanggalMasuk).toLocaleDateString("id-ID"),
                LABEL_TRANSAKSI[batch.jenisTransaksi as keyof typeof LABEL_TRANSAKSI] ||
                batch.jenisTransaksi,
                batch.jumlah,
                batch.sisaJumlah,
                batch.hargaSatuan,
                batch.sisaJumlah * batch.hargaSatuan,
                batch.keterangan || "",
            ]),
            // Footer/Total
            [""],
            ["TOTAL", "", "", totalJumlah, totalSisa, "-", totalNilai, ""],
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Set column widths
        worksheet["!cols"] = [
            { wch: 5 }, // No
            { wch: 15 }, // Tanggal
            { wch: 18 }, // Jenis Transaksi
            { wch: 12 }, // Jumlah Awal
            { wch: 10 }, // Sisa Stok
            { wch: 15 }, // Harga Satuan
            { wch: 18 }, // Total Nilai
            { wch: 25 }, // Keterangan
        ];

        // Merge title cell
        worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Kartu Stok FIFO");

        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Clean filename (remove special chars)
        const cleanName = barang.nama.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_");

        return new NextResponse(excelBuffer, {
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Kartu_Stok_FIFO_${cleanName}.xlsx"`,
            },
        });
    } catch (error) {
        console.error("Error exporting FIFO report:", error);
        return NextResponse.json(
            { error: "Gagal mengekspor laporan FIFO" },
            { status: 500 }
        );
    }
}
