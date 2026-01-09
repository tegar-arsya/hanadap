// app/api/admin/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Pastikan tidak di-cache statis

export async function GET() {
  try {
    // Jalankan query secara paralel agar cepat
    const [totalBarang, totalStok, pendingRequests, approvedRequests, recentRequests] =
      await Promise.all([
        prisma.barang.count(),
        prisma.barang.aggregate({ _sum: { stokTotal: true } }),
        prisma.request.count({ where: { status: "PENDING" } }),
        prisma.request.count({ where: { status: "APPROVED" } }),
        prisma.request.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: true }, // Include user untuk nama/email
        }),
      ]);

    return NextResponse.json({
      totalBarang,
      totalStok: totalStok._sum.stokTotal || 0,
      pendingRequests,
      approvedRequests,
      recentRequests,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}