import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { tambahStok } from "@/lib/fifo";
import { logActivity } from "@/lib/activity-logger";

// POST - Tambah stok (buat batch baru) - Admin only
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { barangId, jumlah, tanggalMasuk, hargaSatuan, jenisTransaksi, keterangan } = body;

        if (!barangId || !jumlah || jumlah <= 0) {
            return NextResponse.json(
                { error: "Barang dan jumlah harus diisi dengan benar" },
                { status: 400 }
            );
        }

        const harga = hargaSatuan !== undefined ? Number(hargaSatuan) : 0;
        if (Number.isNaN(harga) || harga < 0) {
            return NextResponse.json(
                { error: "Harga satuan tidak valid" },
                { status: 400 }
            );
        }

        // Cek apakah barang ada
        const barang = await prisma.barang.findUnique({
            where: { id: barangId },
        });

        if (!barang) {
            return NextResponse.json(
                { error: "Barang tidak ditemukan" },
                { status: 404 }
            );
        }

        // Tambah stok menggunakan FIFO logic
        await tambahStok(barangId, jumlah, {
            tanggalMasuk: tanggalMasuk ? new Date(tanggalMasuk) : undefined,
            hargaSatuan: harga,
            jenisTransaksi: jenisTransaksi || "PEMBELIAN",
            keterangan: keterangan || undefined,
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "ADD_STOCK",
            entity: "BARANG",
            entityId: barangId,
            description: `Menambah stok ${barang.nama} sebanyak ${jumlah} ${barang.satuan} (harga ${harga})`,
        });

        return NextResponse.json(
            { message: "Stok berhasil ditambahkan" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding stock:", error);
        return NextResponse.json(
            { error: "Gagal menambah stok" },
            { status: 500 }
        );
    }
}

// GET - Ambil semua batch untuk barang tertentu
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const barangId = searchParams.get("barangId");

        if (barangId) {
            const batches = await prisma.stockBatch.findMany({
                where: { barangId },
                orderBy: { tanggalMasuk: "asc" },
            });
            return NextResponse.json(batches);
        }

        // Jika tidak ada filter, ambil semua batch dengan info barang
        const batches = await prisma.stockBatch.findMany({
            include: { barang: true },
            orderBy: { tanggalMasuk: "asc" },
        });

        return NextResponse.json(batches);
    } catch (error) {
        console.error("Error fetching batches:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data batch" },
            { status: 500 }
        );
    }
}
