import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Ambil semua unit kerja
export async function GET() {
    try {
        const unitKerja = await prisma.unitKerja.findMany({
            orderBy: { nama: "asc" },
            include: {
                _count: { select: { users: true } },
            },
        });

        return NextResponse.json(unitKerja);
    } catch (error) {
        console.error("Error fetching unit kerja:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data unit kerja" },
            { status: 500 }
        );
    }
}

// POST - Tambah unit kerja baru (Admin only)
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
        const { nama, kode, quotaBulanan } = body;

        if (!nama || !kode) {
            return NextResponse.json(
                { error: "Nama dan kode harus diisi" },
                { status: 400 }
            );
        }

        const unitKerja = await prisma.unitKerja.create({
            data: {
                nama,
                kode: kode.toUpperCase(),
                quotaBulanan: quotaBulanan || 100,
            },
        });

        return NextResponse.json(unitKerja, { status: 201 });
    } catch (error) {
        console.error("Error creating unit kerja:", error);
        return NextResponse.json(
            { error: "Gagal menambah unit kerja" },
            { status: 500 }
        );
    }
}
