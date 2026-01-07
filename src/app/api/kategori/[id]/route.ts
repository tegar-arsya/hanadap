import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Hapus kategori (Admin only)
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

        await prisma.kategori.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Kategori berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting kategori:", error);
        return NextResponse.json(
            { error: "Gagal menghapus kategori" },
            { status: 500 }
        );
    }
}

// PUT - Update kategori (Admin only)
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
        const { nama } = body;

        const kategori = await prisma.kategori.update({
            where: { id },
            data: { nama },
        });

        return NextResponse.json(kategori);
    } catch (error) {
        console.error("Error updating kategori:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate kategori" },
            { status: 500 }
        );
    }
}
