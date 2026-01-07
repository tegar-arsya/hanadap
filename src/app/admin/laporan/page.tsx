"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { pdfExports } from "@/lib/pdf-export";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    SimpleGrid,
    Card,
    Button,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiDownload, FiFileText, FiPackage, FiList, FiAlertTriangle, FiLayers } from "react-icons/fi";

type ReportType = "stok" | "transaksi" | "fifo" | "expiry";

const reports = [
    { id: "stok" as const, label: "Laporan Stok", icon: FiPackage, desc: "Daftar semua barang dan stok", color: "blue" },
    { id: "transaksi" as const, label: "Riwayat Transaksi", icon: FiList, desc: "Log masuk/keluar barang", color: "purple" },
    { id: "fifo" as const, label: "Batch FIFO", icon: FiLayers, desc: "Detail batch per barang", color: "teal" },
    { id: "expiry" as const, label: "Barang Kadaluarsa", icon: FiAlertTriangle, desc: "Barang mendekati expired", color: "orange" },
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
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Laporan</Heading>
                <Text color="gray.500">Generate dan export laporan ke Excel atau PDF</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={8}>
                {reports.map((report) => {
                    const IconComponent = report.icon;
                    return (
                        <Card.Root
                            key={report.id}
                            cursor="pointer"
                            onClick={() => setSelectedReport(report.id)}
                            borderWidth={2}
                            borderColor={selectedReport === report.id ? `${report.color}.500` : "transparent"}
                            bg={selectedReport === report.id ? `${report.color}.50` : "white"}
                            transition="all 0.2s"
                            _hover={{ borderColor: `${report.color}.200` }}
                        >
                            <Card.Body>
                                <HStack gap={4}>
                                    <Box p={3} borderRadius="lg" bg={`${report.color}.100`} color={`${report.color}.600`}>
                                        <IconComponent size={24} />
                                    </Box>
                                    <VStack align="start" gap={0}>
                                        <Text fontWeight="semibold">{report.label}</Text>
                                        <Text fontSize="sm" color="gray.500">{report.desc}</Text>
                                    </VStack>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    );
                })}
            </SimpleGrid>

            <HStack gap={4}>
                <Button
                    colorPalette="green"
                    size="lg"
                    onClick={downloadExcel}
                    loading={loading}
                >
                    <FiDownload />
                    Download Excel
                </Button>
                <Button
                    colorPalette="red"
                    size="lg"
                    onClick={downloadPDF}
                    loading={loading}
                >
                    <FiFileText />
                    Download PDF
                </Button>
            </HStack>
        </Box>
    );
}
