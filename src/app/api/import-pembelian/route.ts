import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { logActivity } from "@/lib/activity-logger";
import {
    parseBulanPembukuan,
    parseNilai,
    JENIS_TRANSAKSI_MASUK,
    isTransaksiMasuk
} from "@/lib/constants/transaksi";

// Types untuk row Excel
interface ImportRow {
    "Bulan Pembukuan di SAKTI"?: string;
    "Jenis Transaksi"?: string;
    "Nama Barang"?: string;
    "Jumlah Barang"?: string | number;
    "Harga Satuan"?: string | number;
    "Total Nilai"?: string | number;
    // Alias columns (lebih pendek)
    bulan?: string;
    jenisTransaksi?: string;
    nama?: string;
    jumlah?: string | number;
    hargaSatuan?: string | number;
    totalNilai?: string | number;
    satuan?: string;
    keterangan?: string;
}

// POST - Import pembelian dari Excel (Format BPS)
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const tahun = formData.get("tahun") as string;

        if (!file) {
            return NextResponse.json(
                { error: "File tidak ditemukan" },
                { status: 400 }
            );
        }

        // Parse tahun (default: tahun saat ini)
        const yearNum = tahun ? parseInt(tahun) : new Date().getFullYear();

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<ImportRow>(worksheet);

        if (data.length === 0) {
            return NextResponse.json(
                { error: "File kosong atau format tidak valid" },
                { status: 400 }
            );
        }

        // Process each row
        const results = {
            success: 0,
            failed: 0,
            created: 0, // Barang baru yang dibuat
            errors: [] as string[],
            details: [] as Array<{
                row: number;
                nama: string;
                status: "success" | "error";
                message: string;
            }>,
        };

        let rowIndex = 1; // Start from 1 for user-friendly row numbers
        for (const row of data) {
            rowIndex++;

            try {
                // Parse data dari format BPS atau format sederhana
                const bulanRaw = row["Bulan Pembukuan di SAKTI"] || row.bulan || "";
                const jenisTransaksiRaw = row["Jenis Transaksi"] || row.jenisTransaksi || "Pembelian";
                const namaBarang = (row["Nama Barang"] || row.nama || "").toString().trim();
                const jumlahRaw = row["Jumlah Barang"] || row.jumlah || 0;
                const hargaSatuanRaw = row["Harga Satuan"] || row.hargaSatuan || 0;
                const satuan = (row.satuan || "pcs").toString().trim();
                const keterangan = row.keterangan?.toString().trim();

                // Validasi nama barang
                if (!namaBarang) {
                    results.errors.push(`Baris ${rowIndex}: Nama barang kosong`);
                    results.details.push({
                        row: rowIndex,
                        nama: "(kosong)",
                        status: "error",
                        message: "Nama barang kosong",
                    });
                    results.failed++;
                    continue;
                }

                // Parse nilai
                const jumlah = typeof jumlahRaw === "number" ? jumlahRaw : parseNilai(jumlahRaw.toString());
                const hargaSatuan = typeof hargaSatuanRaw === "number" ? hargaSatuanRaw : parseNilai(hargaSatuanRaw.toString());

                // Validasi jumlah dan harga
                if (jumlah <= 0) {
                    results.errors.push(`Baris ${rowIndex}: Jumlah harus lebih dari 0`);
                    results.details.push({
                        row: rowIndex,
                        nama: namaBarang,
                        status: "error",
                        message: "Jumlah harus lebih dari 0",
                    });
                    results.failed++;
                    continue;
                }

                if (hargaSatuan <= 0) {
                    results.errors.push(`Baris ${rowIndex}: Harga satuan harus lebih dari 0`);
                    results.details.push({
                        row: rowIndex,
                        nama: namaBarang,
                        status: "error",
                        message: "Harga satuan harus lebih dari 0",
                    });
                    results.failed++;
                    continue;
                }

                // Parse bulan pembukuan
                let tanggalMasuk: Date;
                if (bulanRaw) {
                    const parsed = parseBulanPembukuan(bulanRaw.toString(), yearNum);
                    tanggalMasuk = parsed || new Date();
                } else {
                    tanggalMasuk = new Date();
                }

                // Parse jenis transaksi
                let jenisTransaksi: string = JENIS_TRANSAKSI_MASUK.PEMBELIAN;
                const jenisLower = jenisTransaksiRaw.toString().toLowerCase().trim();

                if (jenisLower.includes("hibah")) {
                    jenisTransaksi = JENIS_TRANSAKSI_MASUK.HIBAH;
                } else if (jenisLower.includes("transfer")) {
                    jenisTransaksi = JENIS_TRANSAKSI_MASUK.TRANSFER_MASUK;
                } else if (jenisLower.includes("saldo") || jenisLower.includes("awal")) {
                    jenisTransaksi = JENIS_TRANSAKSI_MASUK.SALDO_AWAL;
                } else if (jenisLower.includes("koreksi")) {
                    jenisTransaksi = JENIS_TRANSAKSI_MASUK.KOREKSI_TAMBAH;
                }

                // Find or create barang
                let barang = await prisma.barang.findFirst({
                    where: {
                        nama: {
                            equals: namaBarang,
                            mode: "insensitive",
                        }
                    },
                });

                let isNewBarang = false;
                if (!barang) {
                    barang = await prisma.barang.create({
                        data: {
                            nama: namaBarang,
                            satuan: satuan,
                            stokTotal: 0,
                        },
                    });
                    isNewBarang = true;
                    results.created++;
                }

                // Create stock batch
                await prisma.stockBatch.create({
                    data: {
                        barangId: barang.id,
                        jumlah,
                        sisaJumlah: jumlah,
                        hargaSatuan,
                        jenisTransaksi,
                        keterangan,
                        tanggalMasuk,
                    },
                });

                // Update stok total barang
                await prisma.barang.update({
                    where: { id: barang.id },
                    data: {
                        stokTotal: { increment: jumlah },
                    },
                });

                results.success++;
                results.details.push({
                    row: rowIndex,
                    nama: namaBarang,
                    status: "success",
                    message: isNewBarang
                        ? `Berhasil (barang baru dibuat)`
                        : `Berhasil`,
                });

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                results.errors.push(`Baris ${rowIndex}: ${errorMessage}`);
                results.details.push({
                    row: rowIndex,
                    nama: "(error)",
                    status: "error",
                    message: errorMessage,
                });
                results.failed++;
            }
        }

        // Log activity
        await logActivity({
            userId: "system",
            action: "IMPORT",
            entity: "PEMBELIAN",
            description: `Import pembelian dari file "${file.name}": ${results.success} berhasil, ${results.failed} gagal, ${results.created} barang baru dibuat`,
        });

        return NextResponse.json({
            message: `Import selesai`,
            summary: {
                total: data.length,
                success: results.success,
                failed: results.failed,
                newItems: results.created,
            },
            details: results.details,
            errors: results.errors.slice(0, 10), // Limit errors shown
        });

    } catch (error) {
        console.error("Error importing pembelian:", error);
        return NextResponse.json(
            { error: "Gagal mengimport data. Pastikan format file sesuai." },
            { status: 500 }
        );
    }
}

// GET - Download template Excel
export async function GET() {
    try {
        // Create template workbook
        const templateData = [
            {
                "Bulan Pembukuan di SAKTI": "Februari",
                "Jenis Transaksi": "Pembelian",
                "Nama Barang": "Kertas HVS F4 70 gram",
                "Jumlah Barang": 5,
                "Harga Satuan": 60000,
                "Total Nilai": 300000,
            },
            {
                "Bulan Pembukuan di SAKTI": "Mei",
                "Jenis Transaksi": "Pembelian",
                "Nama Barang": "Pulpen Gel Benefit",
                "Jumlah Barang": 24,
                "Harga Satuan": 10000,
                "Total Nilai": 240000,
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);

        // Set column widths
        worksheet["!cols"] = [
            { wch: 25 }, // Bulan Pembukuan
            { wch: 15 }, // Jenis Transaksi
            { wch: 40 }, // Nama Barang
            { wch: 15 }, // Jumlah Barang
            { wch: 15 }, // Harga Satuan
            { wch: 15 }, // Total Nilai
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import");

        const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        return new NextResponse(excelBuffer, {
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="Template_Import_Pembelian_BPS.xlsx"`,
            },
        });

    } catch (error) {
        console.error("Error creating template:", error);
        return NextResponse.json(
            { error: "Gagal membuat template" },
            { status: 500 }
        );
    }
}