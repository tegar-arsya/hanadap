import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "@/lib/activity-logger";

// GET - Ambil semua kategori
export async function GET() {
    try {
        const kategori = await prisma.kategori.findMany({
            orderBy: { nama: "asc" },
            include: {
                _count: { select: { barang: true } },
            },
        });

        return NextResponse.json(kategori);
    } catch (error) {
        console.error("Error fetching kategori:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data kategori" },
            { status: 500 }
        );
    }
}

// POST - Tambah kategori baru (Admin only)
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
        const { nama } = body;

        if (!nama) {
            return NextResponse.json(
                { error: "Nama kategori harus diisi" },
                { status: 400 }
            );
        }

        const kategori = await prisma.kategori.create({
            data: { nama },
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "KATEGORI",
            entityId: kategori.id,
            description: `Membuat kategori baru: ${kategori.nama}`,
        });

        return NextResponse.json(kategori, { status: 201 });
    } catch (error) {
        console.error("Error creating kategori:", error);
        return NextResponse.json(
            { error: "Gagal menambah kategori" },
            { status: 500 }
        );
    }
}
