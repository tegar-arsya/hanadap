"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { pdfExports } from "@/lib/pdf-export";
import { toaster } from "@/components/ui/toaster";
import { FiDownload, FiFileText, FiPackage, FiList, FiAlertTriangle, FiLayers } from "react-icons/fi";
import { PageHeader } from "@/components/ui/shared";

type ReportType = "stok" | "transaksi" | "fifo" | "expiry";

const reports = [
    { id: "stok" as const, label: "Laporan Stok", icon: FiPackage, desc: "Daftar semua barang dan stok" },
    { id: "transaksi" as const, label: "Riwayat Transaksi", icon: FiList, desc: "Log masuk/keluar barang" },
    { id: "fifo" as const, label: "Batch FIFO", icon: FiLayers, desc: "Detail batch per barang" },
    { id: "expiry" as const, label: "Barang Kadaluarsa", icon: FiAlertTriangle, desc: "Barang mendekati expired" },
];

export default function AdminLaporanPage() {
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportType>("stok");

    const fetchReportData = async () => {
        const res = await fetch(`/api/laporan?type=${selectedReport}`);
        const result = await res.json();
        if (!result.data || result.data.length === 0) {
            toaster.create({ title: "Tidak ada data untuk diexport", type: "warning" });
            return null;
        }
        return result;
    };

    const transformData = (result: { data: Record<string, unknown>[] }) => {
        if (selectedReport === "stok") {
            return result.data.map((item) => ({
                nama: item.nama,
                kategori: (item.kategori as Record<string, unknown>)?.nama || "-",
                satuan: item.satuan,
                stokTotal: item.stokTotal,
                stokMinimum: item.stokMinimum,
            }));
        } else if (selectedReport === "transaksi") {
            return result.data.map((item) => ({
                tanggal: new Date(item.createdAt as string).toLocaleDateString("id-ID"),
                barang: (item.barang as Record<string, unknown>)?.nama,
                tipe: item.tipe,
                jumlah: item.jumlah,
                user: (item.user as Record<string, unknown>)?.nama,
            }));
        } else if (selectedReport === "fifo") {
            return result.data.map((item) => ({
                barang: (item.barang as Record<string, unknown>)?.nama,
                tanggalMasuk: new Date(item.tanggalMasuk as string).toLocaleDateString("id-ID"),
                jumlah: item.jumlah,
                sisaJumlah: item.sisaJumlah,
                tanggalExpiry: item.tanggalExpiry
                    ? new Date(item.tanggalExpiry as string).toLocaleDateString("id-ID")
                    : "-",
            }));
        } else {
            return result.data.map((item) => ({
                barang: (item.barang as Record<string, unknown>)?.nama,
                tanggalExpiry: new Date(item.tanggalExpiry as string).toLocaleDateString("id-ID"),
                sisaJumlah: item.sisaJumlah,
            }));
        }
    };

    const downloadExcel = async () => {
        setLoading(true);
        try {
            const result = await fetchReportData();
            if (!result) return;
            const data = transformData(result);
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Laporan");
            XLSX.writeFile(wb, `laporan_${selectedReport}_${new Date().toISOString().split("T")[0]}.xlsx`);
            toaster.create({ title: "Excel berhasil diunduh", type: "success" });
        } catch {
            toaster.create({ title: "Gagal mengunduh", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        setLoading(true);
        try {
            const result = await fetchReportData();
            if (!result) return;
            const data = transformData(result);
            pdfExports[selectedReport](data);
            toaster.create({ title: "PDF berhasil diunduh", type: "success" });
        } catch {
            toaster.create({ title: "Gagal mengunduh", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Laporan" description="Generate dan export laporan ke Excel atau PDF" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {reports.map((report) => {
                    const IconComponent = report.icon;
                    const isSelected = selectedReport === report.id;
                    return (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report.id)}
                            className={`
                                cursor-pointer rounded-xl p-5 transition-all shadow-sm
                                ${isSelected
                                    ? "bg-blue-50 border-2 border-[#005DA6]"
                                    : "bg-white border-2 border-gray-200 hover:border-[#005DA6]"
                                }
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-blue-100 text-[#005DA6]">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{report.label}</p>
                                    <p className="text-sm text-gray-500">{report.desc}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={downloadExcel}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <FiDownload className="w-5 h-5" />
                    )}
                    Download Excel
                </button>
                <button
                    onClick={downloadPDF}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <FiFileText className="w-5 h-5" />
                    )}
                    Download PDF
                </button>
            </div>
        </div>
    );
}
