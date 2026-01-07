import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - Create return request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { barangId, jumlah, keterangan } = body;

        if (!barangId || !jumlah || jumlah <= 0) {
            return NextResponse.json(
                { error: "Barang dan jumlah harus diisi dengan benar" },
                { status: 400 }
            );
        }

        // Get barang info
        const barang = await prisma.barang.findUnique({
            where: { id: barangId },
        });

        if (!barang) {
            return NextResponse.json(
                { error: "Barang tidak ditemukan" },
                { status: 404 }
            );
        }

        // Create new batch for return (FIFO - new batch with current date)
        await prisma.stockBatch.create({
            data: {
                barangId,
                jumlah,
                sisaJumlah: jumlah,
                tanggalMasuk: new Date(),
            },
        });

        // Update total stock
        await prisma.barang.update({
            where: { id: barangId },
            data: {
                stokTotal: { increment: jumlah },
            },
        });

        // Log transaction
        await prisma.transaksiLog.create({
            data: {
                barangId,
                userId: session.user.id,
                tipe: "RETURN",
                jumlah,
                keterangan: keterangan || "Pengembalian barang",
            },
        });

        return NextResponse.json(
            { message: "Barang berhasil dikembalikan" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error processing return:", error);
        return NextResponse.json(
            { error: "Gagal memproses pengembalian" },
            { status: 500 }
        );
    }
}

// GET - Get return history for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const returns = await prisma.transaksiLog.findMany({
            where: {
                userId: session.user.role === "ADMIN" ? undefined : session.user.id,
                tipe: "RETURN",
            },
            orderBy: { createdAt: "desc" },
            include: {
                barang: true,
                user: { select: { nama: true } },
            },
        });

        return NextResponse.json(returns);
    } catch (error) {
        console.error("Error fetching returns:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data return" },
            { status: 500 }
        );
    }
}
