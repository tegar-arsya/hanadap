import { prisma } from "./prisma";

/**
 * FIFO Logic - Mengurangi stok berdasarkan tanggal masuk terlama
 * 
 * @param barangId - ID barang yang akan dikurangi
 * @param jumlah - Jumlah yang akan dikeluarkan
 * @returns true jika berhasil, false jika stok tidak cukup
 */
export async function kurangiStokFIFO(
    barangId: string,
    jumlah: number
): Promise<boolean> {
    // Ambil barang untuk cek stok total
    const barang = await prisma.barang.findUnique({
        where: { id: barangId },
    });

    if (!barang || barang.stokTotal < jumlah) {
        return false; // Stok tidak cukup
    }

    // Ambil batch dengan tanggal masuk terlama yang masih punya sisa
    const batches = await prisma.stockBatch.findMany({
        where: {
            barangId: barangId,
            sisaJumlah: { gt: 0 }, // Masih ada sisa
        },
        orderBy: {
            tanggalMasuk: "asc", // FIFO: yang masuk duluan, keluar duluan
        },
    });

    let sisaKeluarkan = jumlah;

    for (const batch of batches) {
        if (sisaKeluarkan <= 0) break;

        const ambilDariBatch = Math.min(batch.sisaJumlah, sisaKeluarkan);

        // Update sisa batch
        await prisma.stockBatch.update({
            where: { id: batch.id },
            data: {
                sisaJumlah: batch.sisaJumlah - ambilDariBatch,
            },
        });

        sisaKeluarkan -= ambilDariBatch;
    }

    // Update stok total di barang
    await prisma.barang.update({
        where: { id: barangId },
        data: {
            stokTotal: barang.stokTotal - jumlah,
        },
    });

    return true;
}

/**
 * Tambah stok baru (buat batch baru)
 * @param barangId - ID barang
 * @param jumlah - Jumlah barang masuk
 * @param options - Opsi tambahan (tanggalMasuk, hargaSatuan, jenisTransaksi, keterangan, tanggalExpiry)
 */
export async function tambahStok(
    barangId: string,
    jumlah: number,
    options?: {
        tanggalMasuk?: Date;
        hargaSatuan?: number;
        jenisTransaksi?: string;
        keterangan?: string;
        tanggalExpiry?: Date;
    }
): Promise<void> {
    const {
        tanggalMasuk = new Date(),
        hargaSatuan = 0,
        jenisTransaksi = "PEMBELIAN",
        keterangan,
        tanggalExpiry,
    } = options || {};

    // Buat batch baru
    await prisma.stockBatch.create({
        data: {
            barangId,
            jumlah,
            sisaJumlah: jumlah,
            tanggalMasuk,
            hargaSatuan,
            jenisTransaksi,
            keterangan,
            tanggalExpiry,
        },
    });

    // Update stok total
    await prisma.barang.update({
        where: { id: barangId },
        data: {
            stokTotal: { increment: jumlah },
        },
    });
}
