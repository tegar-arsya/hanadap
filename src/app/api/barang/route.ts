import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "@/lib/activity-logger";

// GET - Ambil semua barang
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const kategoriId = searchParams.get("kategoriId");

        const barang = await prisma.barang.findMany({
            where: kategoriId ? { kategoriId } : undefined,
            orderBy: { nama: "asc" },
            include: {
                kategori: true,
                batches: {
                    where: { sisaJumlah: { gt: 0 } },
                    orderBy: { tanggalMasuk: "asc" },
                },
            },
        });

        return NextResponse.json(barang);
    } catch (error) {
        console.error("Error fetching barang:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data barang" },
            { status: 500 }
        );
    }
}

// POST - Tambah barang baru (Admin only)
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
        const { nama, satuan, kategoriId, stokMinimum, barcode } = body;

        if (!nama || !satuan) {
            return NextResponse.json(
                { error: "Nama dan satuan harus diisi" },
                { status: 400 }
            );
        }

        const barang = await prisma.barang.create({
            data: {
                nama,
                satuan,
                kategoriId: kategoriId || null,
                stokMinimum: stokMinimum || 10,
                barcode: barcode || null,
            },
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "BARANG",
            entityId: barang.id,
            description: `Menambah barang baru: ${barang.nama}`,
        });

        return NextResponse.json(barang, { status: 201 });
    } catch (error) {
        console.error("Error creating barang:", error);
        return NextResponse.json(
            { error: "Gagal menambah barang" },
            { status: 500 }
        );
    }
}
