import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logActivity } from "@/lib/activity-logger";

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

        // Get barang name before delete
        const barang = await prisma.barang.findUnique({
            where: { id },
        });

        await prisma.barang.delete({
            where: { id },
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "DELETE",
            entity: "BARANG",
            entityId: id,
            description: `Menghapus barang: ${barang?.nama || id}`,
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

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "UPDATE",
            entity: "BARANG",
            entityId: id,
            description: `Mengupdate barang: ${barang.nama}`,
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
