"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { pdfExports } from "@/lib/pdf-export";
import {
    Box,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Button,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiDownload, FiFileText, FiPackage, FiList, FiAlertTriangle, FiLayers } from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

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

    const showToast = (title: string, type: "success" | "warning" | "error") => {
        toaster.create({ title, type });
    };

    const fetchReportData = async () => {
        const res = await fetch(`/api/laporan?type=${selectedReport}`);
        const result = await res.json();
        if (!result.data || result.data.length === 0) {
            showToast("Tidak ada data untuk diexport", "warning");
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
            showToast("Excel berhasil diunduh", "success");
        } catch {
            showToast("Gagal mengunduh", "error");
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
            showToast("PDF berhasil diunduh", "success");
        } catch {
            showToast("Gagal mengunduh", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader title="Laporan" subtitle="Generate dan export laporan ke Excel atau PDF" />

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={8}>
                {reports.map((report) => {
                    const IconComponent = report.icon;
                    const isSelected = selectedReport === report.id;
                    return (
                        <Box
                            key={report.id}
                            cursor="pointer"
                            onClick={() => setSelectedReport(report.id)}
                            borderRadius="xl"
                            padding="1.25rem"
                            transition="all 0.2s"
                            style={{
                                background: isSelected ? "var(--stat-blue-bg)" : "var(--card-bg)",
                                border: `2px solid ${isSelected ? "var(--stat-blue-color)" : "var(--card-border)"}`,
                                boxShadow: "var(--card-shadow)",
                            }}
                            _hover={{
                                borderColor: "var(--stat-blue-color)",
                            }}
                        >
                            <HStack gap={4}>
                                <Box
                                    p={3}
                                    borderRadius="lg"
                                    style={{
                                        background: "var(--stat-blue-bg)",
                                        color: "var(--stat-blue-color)",
                                    }}
                                >
                                    <IconComponent size={24} />
                                </Box>
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="semibold" style={{ color: "var(--foreground)" }}>{report.label}</Text>
                                    <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>{report.desc}</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    );
                })}
            </SimpleGrid>

            <HStack gap={4} flexWrap="wrap">
                <Button
                    size="lg"
                    onClick={downloadExcel}
                    loading={loading}
                    style={{
                        background: "var(--stat-green-bg)",
                        color: "var(--stat-green-color)",
                        fontWeight: 600,
                    }}
                >
                    <FiDownload />
                    Download Excel
                </Button>
                <Button
                    size="lg"
                    onClick={downloadPDF}
                    loading={loading}
                    style={{
                        background: "var(--stat-red-bg)",
                        color: "var(--stat-red-color)",
                        fontWeight: 600,
                    }}
                >
                    <FiFileText />
                    Download PDF
                </Button>
            </HStack>
        </Box>
    );
}
