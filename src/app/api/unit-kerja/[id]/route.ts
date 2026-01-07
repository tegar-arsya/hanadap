import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Hapus unit kerja (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const { id } = await params;

        await prisma.unitKerja.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Unit kerja berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting unit kerja:", error);
        return NextResponse.json(
            { error: "Gagal menghapus unit kerja" },
            { status: 500 }
        );
    }
}

// PUT - Update unit kerja (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { nama, kode, quotaBulanan } = body;

        const unitKerja = await prisma.unitKerja.update({
            where: { id },
            data: {
                nama,
                kode: kode?.toUpperCase(),
                quotaBulanan,
            },
        });

        return NextResponse.json(unitKerja);
    } catch (error) {
        console.error("Error updating unit kerja:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate unit kerja" },
            { status: 500 }
        );
    }
}
