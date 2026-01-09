import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Generate FIFO report for a specific barang
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

        // Generate FIFO report
        const report = barang.batches.map((batch) => ({
            tanggalMasuk: batch.tanggalMasuk,
            jumlah: batch.jumlah,
            sisaJumlah: batch.sisaJumlah,
            hargaSatuan: batch.hargaSatuan,
            totalNilai: batch.sisaJumlah * batch.hargaSatuan,
            jenisTransaksi: batch.jenisTransaksi,
        }));

        return NextResponse.json({
            barang: barang.nama,
            satuan: barang.satuan,
            report,
        });
    } catch (error) {
        console.error("Error generating FIFO report:", error);
        return NextResponse.json(
            { error: "Gagal membuat laporan FIFO" },
            { status: 500 }
        );
    }
}