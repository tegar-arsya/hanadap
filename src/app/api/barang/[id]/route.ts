import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Hapus barang (Admin only)
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

        await prisma.barang.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Barang berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting barang:", error);
        return NextResponse.json(
            { error: "Gagal menghapus barang" },
            { status: 500 }
        );
    }
}

// PUT - Update barang (Admin only)
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
        const { nama, satuan } = body;

        const barang = await prisma.barang.update({
            where: { id },
            data: { nama, satuan },
        });

        return NextResponse.json(barang);
    } catch (error) {
        console.error("Error updating barang:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate barang" },
            { status: 500 }
        );
    }
}
