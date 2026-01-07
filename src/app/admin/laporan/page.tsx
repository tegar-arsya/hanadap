"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import styles from "./laporan.module.css";

type ReportType = "stok" | "transaksi" | "fifo" | "expiry";

interface ReportData {
    type: string;
    data: Record<string, unknown>[];
    generatedAt: string;
}

export default function AdminLaporanPage() {
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportType>("stok");

    const reports = [
        { id: "stok" as const, label: "Laporan Stok", icon: "📦", desc: "Daftar semua barang dan stok" },
        { id: "transaksi" as const, label: "Riwayat Transaksi", icon: "📋", desc: "Log masuk/keluar barang" },
        { id: "fifo" as const, label: "Batch FIFO", icon: "🔢", desc: "Detail batch per barang" },
        { id: "expiry" as const, label: "Barang Kadaluarsa", icon: "⚠️", desc: "Barang mendekati expired" },
    ];

    const downloadExcel = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/laporan?type=${selectedReport}`);
            const result: ReportData = await res.json();

            if (!result.data || result.data.length === 0) {
                alert("Tidak ada data untuk diexport");
                return;
            }

            // Transform data for Excel
            let excelData: Record<string, unknown>[] = [];

            if (selectedReport === "stok") {
                excelData = result.data.map((item: Record<string, unknown>) => ({
                    "Nama Barang": item.nama,
                    "Kategori": (item.kategori as Record<string, unknown>)?.nama || "-",
                    "Satuan": item.satuan,
                    "Stok Total": item.stokTotal,
                    "Stok Minimum": item.stokMinimum,
                }));
            } else if (selectedReport === "transaksi") {
                excelData = result.data.map((item: Record<string, unknown>) => ({
                    "Tanggal": new Date(item.createdAt as string).toLocaleDateString("id-ID"),
                    "Barang": (item.barang as Record<string, unknown>)?.nama,
                    "Tipe": item.tipe,
                    "Jumlah": item.jumlah,
                    "User": (item.user as Record<string, unknown>)?.nama,
                    "Keterangan": item.keterangan || "-",
                }));
            } else if (selectedReport === "fifo") {
                excelData = result.data.map((item: Record<string, unknown>) => ({
                    "Barang": (item.barang as Record<string, unknown>)?.nama,
                    "Tanggal Masuk": new Date(item.tanggalMasuk as string).toLocaleDateString("id-ID"),
                    "Jumlah Awal": item.jumlah,
                    "Sisa": item.sisaJumlah,
                    "Tanggal Expiry": item.tanggalExpiry
                        ? new Date(item.tanggalExpiry as string).toLocaleDateString("id-ID")
                        : "-",
                }));
            } else if (selectedReport === "expiry") {
                excelData = result.data.map((item: Record<string, unknown>) => ({
                    "Barang": (item.barang as Record<string, unknown>)?.nama,
                    "Tanggal Expiry": new Date(item.tanggalExpiry as string).toLocaleDateString("id-ID"),
                    "Sisa Stok": item.sisaJumlah,
                }));
            }

            // Create workbook and download
            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan");
            XLSX.writeFile(wb, `laporan_${selectedReport}_${new Date().toISOString().split("T")[0]}.xlsx`);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Gagal mengunduh laporan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Laporan</h1>
            <p className={styles.subtitle}>Generate dan export laporan ke Excel</p>

            <div className={styles.reportGrid}>
                {reports.map((report) => (
                    <div
                        key={report.id}
                        className={`${styles.reportCard} ${selectedReport === report.id ? styles.selected : ""
                            }`}
                        onClick={() => setSelectedReport(report.id)}
                    >
                        <span className={styles.reportIcon}>{report.icon}</span>
                        <h3>{report.label}</h3>
                        <p>{report.desc}</p>
                    </div>
                ))}
            </div>

            <button
                className={styles.downloadBtn}
                onClick={downloadExcel}
                disabled={loading}
            >
                {loading ? "Mengunduh..." : "📥 Download Excel"}
            </button>
        </div>
    );
}
