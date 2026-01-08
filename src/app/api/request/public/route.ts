import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";

// POST - Buat request baru tanpa login (Public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { namaPemohon, emailPemohon, unitKerjaId, items, catatan } = body;

        // Validasi
        if (!namaPemohon || !emailPemohon || !unitKerjaId) {
            return NextResponse.json(
                { error: "Nama, email, dan unit kerja harus diisi" },
                { status: 400 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Minimal harus ada 1 item" },
                { status: 400 }
            );
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailPemohon)) {
            return NextResponse.json(
                { error: "Format email tidak valid" },
                { status: 400 }
            );
        }

        // Cek unit kerja ada
        const unitKerja = await prisma.unitKerja.findUnique({
            where: { id: unitKerjaId },
        });

        if (!unitKerja) {
            return NextResponse.json(
                { error: "Unit kerja tidak ditemukan" },
                { status: 404 }
            );
        }

        // Cari atau buat user temporary berdasarkan email
        let user = await prisma.user.findUnique({
            where: { email: emailPemohon },
        });

        if (!user) {
            // Buat user baru sebagai guest (tanpa password, tidak bisa login)
            user = await prisma.user.create({
                data: {
                    email: emailPemohon,
                    nama: namaPemohon,
                    password: "", // Empty password = tidak bisa login
                    role: "UNIT_KERJA",
                    unitKerjaId: unitKerjaId,
                    isActive: true,
                },
            });
        } else {
            // Update nama jika berbeda
            if (user.nama !== namaPemohon) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { nama: namaPemohon },
                });
            }
        }

        // Buat request dengan items
        const newRequest = await prisma.request.create({
            data: {
                userId: user.id,
                catatan,
                items: {
                    create: items.map(
                        (item: { barangId: string; jumlahDiminta: number }) => ({
                            barangId: item.barangId,
                            jumlahDiminta: item.jumlahDiminta,
                        })
                    ),
                },
            },
            include: {
                items: { include: { barang: true } },
                user: { select: { nama: true, email: true } },
            },
        });

        // Log activity
        const itemDetails = newRequest.items
            .map((item) => `${item.barang.nama} (${item.jumlahDiminta})`)
            .join(", ");

        await logActivity({
            userId: user.id,
            action: "CREATE",
            entity: "REQUEST",
            entityId: newRequest.id,
            description: `Request publik dari ${namaPemohon} (${emailPemohon}): ${itemDetails}`,
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating public request:", error);
        return NextResponse.json(
            { error: "Gagal membuat request" },
            { status: 500 }
        );
    }
}
