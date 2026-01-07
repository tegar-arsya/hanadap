import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

// GET - Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
                unitKerja: { select: { nama: true, kode: true } },
                createdAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Gagal mengambil profil" },
            { status: 500 }
        );
    }
}

// PATCH - Update current user profile
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { nama, currentPassword, newPassword } = body;

        const updateData: Record<string, unknown> = {};

        // Update nama if provided
        if (nama) {
            updateData.nama = nama;
        }

        // Update password if provided
        if (newPassword && currentPassword) {
            // Verify current password
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { password: true },
            });

            if (!user) {
                return NextResponse.json(
                    { error: "User tidak ditemukan" },
                    { status: 404 }
                );
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: "Password lama salah" },
                    { status: 400 }
                );
            }

            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "Tidak ada data yang diubah" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                nama: true,
                role: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Gagal mengupdate profil" },
            { status: 500 }
        );
    }
}
