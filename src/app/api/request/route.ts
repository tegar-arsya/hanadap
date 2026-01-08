import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kurangiStokFIFO } from "@/lib/fifo";
import { logActivity } from "@/lib/activity-logger";
import { sendEmail, emailTemplates } from "@/lib/email";

// GET - Ambil semua request (filtered by role)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        let requests;

        if (session.user.role === "ADMIN") {
            // Admin bisa lihat semua request
            requests = await prisma.request.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    user: { 
                        select: { 
                            nama: true, 
                            email: true,
                            unitKerja: { select: { nama: true, kode: true } }
                        } 
                    },
                    items: {
                        include: { barang: true },
                    },
                },
            });
        } else {
            // Unit Kerja hanya lihat request sendiri
            requests = await prisma.request.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        include: { barang: true },
                    },
                },
            });
        }

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data request" },
            { status: 500 }
        );
    }
}

// POST - Buat request baru (Unit Kerja)
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
        const { items, catatan } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Minimal harus ada 1 item" },
                { status: 400 }
            );
        }

        // Buat request dengan items
        const newRequest = await prisma.request.create({
            data: {
                userId: session.user.id,
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
            },
        });

        // Log activity dengan detail barang
        const itemDetails = newRequest.items
            .map((item) => `${item.barang.nama} (${item.jumlahDiminta})`)
            .join(", ");

        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "REQUEST",
            entityId: newRequest.id,
            description: `Membuat request baru: ${itemDetails}`,
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating request:", error);
        return NextResponse.json(
            { error: "Gagal membuat request" },
            { status: 500 }
        );
    }
}

// PATCH - Approve/Reject request (Admin only)
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { requestId, status, approvedItems } = body;

        if (!requestId || !status) {
            return NextResponse.json(
                { error: "Request ID dan status harus diisi" },
                { status: 400 }
            );
        }

        if (status === "APPROVED") {
            // Proses FIFO untuk setiap item yang disetujui
            for (const item of approvedItems || []) {
                const jumlahDisetujui = item.jumlahDisetujui || item.jumlahDiminta;

                // Kurangi stok dengan FIFO
                const success = await kurangiStokFIFO(item.barangId, jumlahDisetujui);

                if (!success) {
                    return NextResponse.json(
                        { error: `Stok tidak cukup untuk ${item.barangNama || "barang"}` },
                        { status: 400 }
                    );
                }

                // Update jumlah disetujui di RequestItem
                await prisma.requestItem.update({
                    where: { id: item.id },
                    data: { jumlahDisetujui },
                });
            }
        }

        // Update status request
        const updatedRequest = await prisma.request.update({
            where: { id: requestId },
            data: { status },
            include: {
                items: { include: { barang: true } },
                user: { select: { nama: true, email: true } },
            },
        });

        // Log activity dengan detail barang dan admin
        const itemDetails = updatedRequest.items
            .map((item) => `${item.barang.nama} (${item.jumlahDiminta})`)
            .join(", ");

        await logActivity({
            userId: session.user.id,
            action: status === "APPROVED" ? "APPROVE" : "REJECT",
            entity: "REQUEST",
            entityId: requestId,
            description: `Request ${status === "APPROVED" ? "disetujui" : "ditolak"} oleh ${session.user.name}: ${itemDetails}`,
        });

        // Kirim email notifikasi ke peminta jika SMTP tersedia
        if (updatedRequest.user?.email) {
            if (status === "APPROVED") {
                const items = updatedRequest.items.map((item) => `${item.barang.nama} (${item.jumlahDisetujui || item.jumlahDiminta})`);
                const template = emailTemplates.requestApproved(updatedRequest.user.nama || "Pengguna", items);
                await sendEmail({ to: updatedRequest.user.email, ...template }).catch((err) => console.error("[Email] Failed to send approval email", err));
            } else if (status === "REJECTED") {
                const template = emailTemplates.requestRejected(updatedRequest.user.nama || "Pengguna", "Tidak tersedia");
                await sendEmail({ to: updatedRequest.user.email, ...template }).catch((err) => console.error("[Email] Failed to send rejection email", err));
            }
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Error updating request:", error);
        return NextResponse.json(
            { error: "Gagal memproses request" },
            { status: 500 }
        );
    }
}
