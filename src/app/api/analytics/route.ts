import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get analytics data
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        // Get date range for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Top 5 most requested items
        const topItems = await prisma.requestItem.groupBy({
            by: ["barangId"],
            _sum: { jumlahDiminta: true },
            orderBy: { _sum: { jumlahDiminta: "desc" } },
            take: 5,
        });

        // Get barang names for top items
        const topItemsWithNames = await Promise.all(
            topItems.map(async (item) => {
                const barang = await prisma.barang.findUnique({
                    where: { id: item.barangId },
                    select: { nama: true },
                });
                return {
                    nama: barang?.nama || "Unknown",
                    total: item._sum.jumlahDiminta || 0,
                };
            })
        );

        // Stock in vs out
        const transaksiLogs = await prisma.transaksiLog.groupBy({
            by: ["tipe"],
            _sum: { jumlah: true },
        });

        const stokMasuk = transaksiLogs.find((t) => t.tipe === "MASUK")?._sum.jumlah || 0;
        const stokKeluar = transaksiLogs.find((t) => t.tipe === "KELUAR")?._sum.jumlah || 0;
        const stokReturn = transaksiLogs.find((t) => t.tipe === "RETURN")?._sum.jumlah || 0;

        // Low stock items - use raw comparison
        const allBarang = await prisma.barang.findMany({
            select: { id: true, nama: true, stokTotal: true, stokMinimum: true },
        });
        const lowStockItems = allBarang.filter(b => b.stokTotal <= b.stokMinimum);

        // Pending requests count
        const pendingRequests = await prisma.request.count({
            where: { status: "PENDING" },
        });

        // Total statistics
        const totalBarang = await prisma.barang.count();
        const totalStok = await prisma.barang.aggregate({
            _sum: { stokTotal: true },
        });

        // Monthly requests count
        const monthlyRequests = await prisma.request.count({
            where: {
                createdAt: { gte: sixMonthsAgo },
            },
        });

        return NextResponse.json({
            topItems: topItemsWithNames,
            stockFlow: { masuk: stokMasuk, keluar: stokKeluar, return: stokReturn },
            lowStockItems,
            pendingRequests,
            totalBarang,
            totalStok: totalStok._sum.stokTotal || 0,
            monthlyRequests,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data analytics" },
            { status: 500 }
        );
    }
}
