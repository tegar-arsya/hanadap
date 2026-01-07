import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET - Get all approval levels
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const levels = await prisma.approvalLevel.findMany({
            orderBy: { level: "asc" },
        });

        return NextResponse.json(levels);
    } catch (error) {
        console.error("Error fetching approval levels:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data approval level" },
            { status: 500 }
        );
    }
}

// POST - Create new approval level
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { level, nama, roleRequired } = body;

        if (!level || !nama || !roleRequired) {
            return NextResponse.json(
                { error: "Level, nama, dan role harus diisi" },
                { status: 400 }
            );
        }

        const approvalLevel = await prisma.approvalLevel.create({
            data: {
                level,
                nama,
                roleRequired,
            },
        });

        return NextResponse.json(approvalLevel, { status: 201 });
    } catch (error) {
        console.error("Error creating approval level:", error);
        return NextResponse.json(
            { error: "Gagal menambah approval level" },
            { status: 500 }
        );
    }
}

// DELETE - Delete approval level
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID harus diisi" },
                { status: 400 }
            );
        }

        await prisma.approvalLevel.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Approval level berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting approval level:", error);
        return NextResponse.json(
            { error: "Gagal menghapus approval level" },
            { status: 500 }
        );
    }
}
