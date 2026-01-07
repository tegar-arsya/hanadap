import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // ============================================
    // Create Kategori
    // ============================================
    const kategoriATK = await prisma.kategori.upsert({
        where: { nama: "ATK" },
        update: {},
        create: { nama: "ATK" },
    });

    const kategoriElektronik = await prisma.kategori.upsert({
        where: { nama: "Elektronik" },
        update: {},
        create: { nama: "Elektronik" },
    });

    const kategoriCleaning = await prisma.kategori.upsert({
        where: { nama: "Cleaning Supply" },
        update: {},
        create: { nama: "Cleaning Supply" },
    });

    console.log("Created kategori:", kategoriATK.nama, kategoriElektronik.nama, kategoriCleaning.nama);

    // ============================================
    // Create Unit Kerja
    // ============================================
    const unitIT = await prisma.unitKerja.upsert({
        where: { kode: "IT" },
        update: {},
        create: {
            nama: "IT Department",
            kode: "IT",
            quotaBulanan: 150,
        },
    });

    const unitHRD = await prisma.unitKerja.upsert({
        where: { kode: "HRD" },
        update: {},
        create: {
            nama: "Human Resources",
            kode: "HRD",
            quotaBulanan: 100,
        },
    });

    const unitFinance = await prisma.unitKerja.upsert({
        where: { kode: "FIN" },
        update: {},
        create: {
            nama: "Finance",
            kode: "FIN",
            quotaBulanan: 80,
        },
    });

    console.log("Created unit kerja:", unitIT.kode, unitHRD.kode, unitFinance.kode);

    // ============================================
    // Create Users
    // ============================================
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@hanadap.com" },
        update: {},
        create: {
            email: "admin@hanadap.com",
            password: adminPassword,
            nama: "Administrator",
            role: "ADMIN",
        },
    });
    console.log("Created admin:", admin.email);

    const userPassword = await bcrypt.hash("user123", 10);
    const userIT = await prisma.user.upsert({
        where: { email: "it@hanadap.com" },
        update: {},
        create: {
            email: "it@hanadap.com",
            password: userPassword,
            nama: "Staff IT",
            role: "UNIT_KERJA",
            unitKerjaId: unitIT.id,
        },
    });
    console.log("Created unit kerja user:", userIT.email);

    const userHRD = await prisma.user.upsert({
        where: { email: "hrd@hanadap.com" },
        update: {},
        create: {
            email: "hrd@hanadap.com",
            password: userPassword,
            nama: "Staff HRD",
            role: "UNIT_KERJA",
            unitKerjaId: unitHRD.id,
        },
    });
    console.log("Created unit kerja user:", userHRD.email);

    // ============================================
    // Create Barang with Kategori
    // ============================================
    const barang1 = await prisma.barang.upsert({
        where: { id: "barang-1" },
        update: { kategoriId: kategoriATK.id },
        create: {
            id: "barang-1",
            nama: "Kertas A4",
            satuan: "rim",
            stokTotal: 0,
            stokMinimum: 20,
            kategoriId: kategoriATK.id,
        },
    });

    const barang2 = await prisma.barang.upsert({
        where: { id: "barang-2" },
        update: { kategoriId: kategoriATK.id },
        create: {
            id: "barang-2",
            nama: "Pulpen",
            satuan: "pcs",
            stokTotal: 0,
            stokMinimum: 50,
            kategoriId: kategoriATK.id,
        },
    });

    const barang3 = await prisma.barang.upsert({
        where: { id: "barang-3" },
        update: { kategoriId: kategoriElektronik.id },
        create: {
            id: "barang-3",
            nama: "Tinta Printer",
            satuan: "botol",
            stokTotal: 0,
            stokMinimum: 5,
            kategoriId: kategoriElektronik.id,
        },
    });

    const barang4 = await prisma.barang.upsert({
        where: { id: "barang-4" },
        update: { kategoriId: kategoriCleaning.id },
        create: {
            id: "barang-4",
            nama: "Sabun Cuci Tangan",
            satuan: "liter",
            stokTotal: 0,
            stokMinimum: 10,
            kategoriId: kategoriCleaning.id,
        },
    });

    console.log("Created barang:", barang1.nama, barang2.nama, barang3.nama, barang4.nama);

    // ============================================
    // Add Stock Batches (FIFO demo)
    // ============================================
    // Clear existing batches first
    await prisma.stockBatch.deleteMany({});

    // Kertas A4 - 2 batches
    await prisma.stockBatch.create({
        data: {
            barangId: barang1.id,
            jumlah: 50,
            sisaJumlah: 50,
            tanggalMasuk: new Date("2024-01-01"),
        },
    });

    await prisma.stockBatch.create({
        data: {
            barangId: barang1.id,
            jumlah: 30,
            sisaJumlah: 30,
            tanggalMasuk: new Date("2024-01-15"),
        },
    });

    await prisma.barang.update({
        where: { id: barang1.id },
        data: { stokTotal: 80 },
    });

    // Pulpen
    await prisma.stockBatch.create({
        data: {
            barangId: barang2.id,
            jumlah: 100,
            sisaJumlah: 100,
            tanggalMasuk: new Date("2024-01-10"),
        },
    });

    await prisma.barang.update({
        where: { id: barang2.id },
        data: { stokTotal: 100 },
    });

    // Tinta Printer
    await prisma.stockBatch.create({
        data: {
            barangId: barang3.id,
            jumlah: 20,
            sisaJumlah: 20,
            tanggalMasuk: new Date("2024-01-05"),
        },
    });

    await prisma.barang.update({
        where: { id: barang3.id },
        data: { stokTotal: 20 },
    });

    // Sabun
    await prisma.stockBatch.create({
        data: {
            barangId: barang4.id,
            jumlah: 15,
            sisaJumlah: 15,
            tanggalMasuk: new Date("2024-01-08"),
            tanggalExpiry: new Date("2025-06-01"), // Has expiry date
        },
    });

    await prisma.barang.update({
        where: { id: barang4.id },
        data: { stokTotal: 15 },
    });

    console.log("Created stock batches");

    console.log("\n✅ Seeding completed!");
    console.log("\n📋 Login credentials:");
    console.log("Admin: admin@hanadap.com / admin123");
    console.log("IT Staff: it@hanadap.com / user123");
    console.log("HRD Staff: hrd@hanadap.com / user123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
