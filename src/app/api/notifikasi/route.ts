import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get notifications for current user
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const notifikasi = await prisma.notifikasi.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
        });

        const unreadCount = await prisma.notifikasi.count({
            where: { userId: session.user.id, dibaca: false },
        });

        return NextResponse.json({ notifikasi, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "Gagal mengambil notifikasi" },
            { status: 500 }
        );
    }
}

// PATCH - Mark notifications as read
export async function PATCH() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        await prisma.notifikasi.updateMany({
            where: { userId: session.user.id, dibaca: false },
            data: { dibaca: true },
        });

        return NextResponse.json({ message: "Notifikasi ditandai sudah dibaca" });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate notifikasi" },
            { status: 500 }
        );
    }
}
