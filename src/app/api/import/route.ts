import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as XLSX from "xlsx";
import { logActivity } from "@/lib/activity-logger";

// POST - Import barang from Excel
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Tidak diizinkan" },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "File tidak ditemukan" },
                { status: 400 }
            );
        }

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (data.length === 0) {
            return NextResponse.json(
                { error: "File kosong atau format tidak valid" },
                { status: 400 }
            );
        }

        // Validate columns
        const requiredColumns = ["nama", "satuan"];
        const firstRow = data[0];
        const missingColumns = requiredColumns.filter(
            (col) => !(col in firstRow)
        );

        if (missingColumns.length > 0) {
            return NextResponse.json(
                { error: `Kolom wajib tidak ditemukan: ${missingColumns.join(", ")}` },
                { status: 400 }
            );
        }

        // Process each row
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        for (const row of data) {
            try {
                const nama = String(row.nama || "").trim();
                const satuan = String(row.satuan || "").trim();
                const stokMinimum = parseInt(String(row.stokMinimum || row["stok_minimum"] || "10"));
                const kategoriNama = String(row.kategori || "").trim();
                const barcode = String(row.barcode || "").trim() || null;

                if (!nama || !satuan) {
                    results.errors.push(`Row skipped: nama atau satuan kosong`);
                    results.failed++;
                    continue;
                }

                // Find or create kategori
                let kategoriId = null;
                if (kategoriNama) {
                    const kategori = await prisma.kategori.upsert({
                        where: { nama: kategoriNama },
                        update: {},
                        create: { nama: kategoriNama },
                    });
                    kategoriId = kategori.id;
                }

                // Create or update barang
                await prisma.barang.upsert({
                    where: {
                        id: `import-${nama.toLowerCase().replace(/\s+/g, "-")}`
                    },
                    update: {
                        satuan,
                        stokMinimum,
                        kategoriId,
                        barcode,
                    },
                    create: {
                        id: `import-${nama.toLowerCase().replace(/\s+/g, "-")}`,
                        nama,
                        satuan,
                        stokMinimum,
                        kategoriId,
                        barcode,
                    },
                });

                results.success++;
            } catch (error) {
                results.errors.push(`Error: ${error}`);
                results.failed++;
            }
        }

        // Log activity
        await logActivity({
            userId: session.user.id,
            action: "IMPORT",
            entity: "BARANG",
            description: `Import barang: ${results.success} berhasil, ${results.failed} gagal`,
        });

        return NextResponse.json({
            message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
            ...results,
        });
    } catch (error) {
        console.error("Error importing:", error);
        return NextResponse.json(
            { error: "Gagal mengimport data" },
            { status: 500 }
        );
    }
}
