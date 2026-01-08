import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Tracking permintaan berdasarkan ID atau email (Public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const email = searchParams.get("email");

        if (id) {
            // Cari berdasarkan ID permintaan
            const req = await prisma.request.findUnique({
                where: { id },
                include: {
                    user: { select: { nama: true, email: true } },
                    items: {
                        include: { barang: { select: { nama: true, satuan: true } } },
                    },
                },
            });

            if (!req) {
                return NextResponse.json(null);
            }

            return NextResponse.json(req);
        }

        if (email) {
            // Cari user berdasarkan email
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                return NextResponse.json([]);
            }

            // Cari semua permintaan user tersebut
            const requests = await prisma.request.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { nama: true, email: true } },
                    items: {
                        include: { barang: { select: { nama: true, satuan: true } } },
                    },
                },
            });

            return NextResponse.json(requests);
        }

        return NextResponse.json(
            { error: "ID atau email harus disertakan" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error tracking request:", error);
        return NextResponse.json(
            { error: "Gagal mencari permintaan" },
            { status: 500 }
        );
    }
}
