import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/activity-logger";

// GET - Get all users (Admin only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                isActive: true,
                unitKerjaId: true,
                unitKerja: { select: { nama: true, kode: true } },
                createdAt: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Gagal mengambil data user" },
            { status: 500 }
        );
    }
}

// POST - Create new user (Admin only)
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
        const { email, password, nama, role, unitKerjaId } = body;

        if (!email || !password || !nama || !role) {
            return NextResponse.json(
                { error: "Email, password, nama, dan role harus diisi" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email sudah digunakan" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nama,
                role,
                unitKerjaId: unitKerjaId || null,
            },
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                unitKerjaId: true,
            },
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "USER",
            entityId: user.id,
            description: `Membuat user baru: ${user.nama} (${user.email})`,
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Gagal menambah user" },
            { status: 500 }
        );
    }
}

// PATCH - Update user (Admin only)
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
        const { id, nama, role, unitKerjaId, isActive, newPassword } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID user harus diisi" },
                { status: 400 }
            );
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (nama !== undefined) updateData.nama = nama;
        if (role !== undefined) updateData.role = role;
        if (unitKerjaId !== undefined) updateData.unitKerjaId = unitKerjaId || null;
        if (isActive !== undefined) updateData.isActive = isActive;

        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                isActive: true,
                unitKerjaId: true,
            },
        });

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "UPDATE",
            entity: "USER",
            entityId: user.id,
            description: `Mengupdate user: ${user.nama}`,
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate user" },
            { status: 500 }
        );
    }
}
