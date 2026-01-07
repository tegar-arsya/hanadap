import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get report data based on type
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "stok";

        if (type === "stok") {
            // Stock report
            const barang = await prisma.barang.findMany({
                orderBy: { nama: "asc" },
                include: {
                    kategori: true,
                    batches: {
                        where: { sisaJumlah: { gt: 0 } },
                        orderBy: { tanggalMasuk: "asc" },
                    },
                },
            });

            return NextResponse.json({
                type: "stok",
                data: barang,
                generatedAt: new Date().toISOString(),
            });
        }

        if (type === "transaksi") {
            // Transaction history
            const transaksi = await prisma.transaksiLog.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    barang: true,
                    user: { select: { nama: true } },
                },
                take: 100,
            });

            return NextResponse.json({
                type: "transaksi",
                data: transaksi,
                generatedAt: new Date().toISOString(),
            });
        }

        if (type === "fifo") {
            // FIFO batch report
            const batches = await prisma.stockBatch.findMany({
                orderBy: [{ barangId: "asc" }, { tanggalMasuk: "asc" }],
                include: {
                    barang: { select: { nama: true, satuan: true } },
                },
            });

            return NextResponse.json({
                type: "fifo",
                data: batches,
                generatedAt: new Date().toISOString(),
            });
        }

        if (type === "expiry") {
            // Expiry report
            const today = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(today.getDate() + 30);

            const expiringBatches = await prisma.stockBatch.findMany({
                where: {
                    tanggalExpiry: { lte: thirtyDaysLater },
                    sisaJumlah: { gt: 0 },
                },
                orderBy: { tanggalExpiry: "asc" },
                include: {
                    barang: { select: { nama: true, satuan: true } },
                },
            });

            return NextResponse.json({
                type: "expiry",
                data: expiringBatches,
                generatedAt: new Date().toISOString(),
            });
        }

        return NextResponse.json(
            { error: "Tipe laporan tidak valid" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error generating report:", error);
        return NextResponse.json(
            { error: "Gagal membuat laporan" },
            { status: 500 }
        );
    }
}
