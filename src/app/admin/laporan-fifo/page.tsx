"use client";

import { useState, useEffect } from "react";
import {
    FiPackage,
    FiCalendar,
    FiDownload,
    FiSearch,
    FiBarChart2,
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiChevronDown,
    FiChevronRight,
} from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";
import { LABEL_TRANSAKSI } from "@/lib/constants/transaksi";

// Types
interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
}

interface StockBatch {
    id: string;
    jumlah: number;
    sisaJumlah: number;
    hargaSatuan: number;
    jenisTransaksi: string;
    tanggalMasuk: string;
    keterangan?: string;
}

interface FIFOReport {
    barang: string;
    satuan: string;
    report: Array<{
        tanggalMasuk: string;
        jumlah: number;
        sisaJumlah: number;
        hargaSatuan: number;
        totalNilai: number;
        jenisTransaksi: string;
    }>;
}

export default function LaporanFIFOPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [selectedBarang, setSelectedBarang] = useState<string>("");
    const [report, setReport] = useState<FIFOReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingExport, setLoadingExport] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAllBatches, setShowAllBatches] = useState(false);

    // Fetch barang list
    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch("/api/barang");
                const data = await res.json();
                setBarangList(data);
            } catch (error) {
                console.error("Error fetching barang:", error);
            }
        };
        fetchBarang();
    }, []);

    // Fetch FIFO report when barang selected
    const fetchReport = async (barangId: string) => {
        if (!barangId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/laporan-fifo?barangId=${barangId}`);
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBarangChange = (barangId: string) => {
        setSelectedBarang(barangId);
        fetchReport(barangId);
    };

    // Export to Excel
    const handleExport = async () => {
        if (!selectedBarang) return;

        setLoadingExport(true);
        try {
            const res = await fetch(`/api/laporan-fifo/export?barangId=${selectedBarang}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Kartu_Stok_FIFO_${report?.barang || "barang"}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting:", error);
        } finally {
            setLoadingExport(false);
        }
    };

    // Filter barang by search
    const filteredBarang = barangList.filter((b) =>
        b.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate summary
    const summary = report
        ? {
            totalBatch: report.report.length,
            totalStok: report.report.reduce((sum, r) => sum + r.sisaJumlah, 0),
            totalNilai: report.report.reduce((sum, r) => sum + r.totalNilai, 0),
            avgHarga:
                report.report.length > 0
                    ? Math.round(
                        report.report.reduce((sum, r) => sum + r.hargaSatuan, 0) /
                        report.report.length
                    )
                    : 0,
        }
        : null;

    // Format currency
    const formatRupiah = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    // Get batches to show
    const batchesToShow = showAllBatches
        ? report?.report || []
        : (report?.report || []).slice(0, 10);

    return (
        <div className="max-w-6xl">
            <PageHeader
                title="Kartu Stok FIFO"
                description="Laporan persediaan barang dengan metode First In First Out"
            />

            {/* Barang Selection */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FiPackage className="inline w-4 h-4 mr-1" />
                            Pilih Barang
                        </label>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cari barang..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedBarang}
                            onChange={(e) => handleBarangChange(e.target.value)}
                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            size={5}
                        >
                            <option value="">-- Pilih Barang --</option>
                            {filteredBarang.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.nama} ({b.satuan}) - Stok: {b.stokTotal}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleExport}
                            disabled={!selectedBarang || loadingExport}
                            className={`
                                flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all
                                ${selectedBarang
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }
                            `}
                        >
                            <FiDownload className="w-4 h-4" />
                            {loadingExport ? "Mengunduh..." : "Export Excel"}
                        </button>
                    </div>
                </div>
            </Card>

            {/* Loading */}
            {loading && (
                <Card className="mb-6">
                    <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <span className="ml-3 text-gray-600">Memuat laporan...</span>
                    </div>
                </Card>
            )}

            {/* Report Content */}
            {report && !loading && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500 rounded-xl">
                                    <FiPackage className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600">Total Batch</p>
                                    <p className="text-2xl font-bold text-blue-800">
                                        {summary?.totalBatch}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500 rounded-xl">
                                    <FiTrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-600">Sisa Stok</p>
                                    <p className="text-2xl font-bold text-green-800">
                                        {summary?.totalStok} {report.satuan}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-500 rounded-xl">
                                    <FiDollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-600">Total Nilai</p>
                                    <p className="text-lg font-bold text-orange-800">
                                        {formatRupiah(summary?.totalNilai || 0)}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500 rounded-xl">
                                    <FiBarChart2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-600">Harga Rata-rata</p>
                                    <p className="text-lg font-bold text-purple-800">
                                        {formatRupiah(summary?.avgHarga || 0)}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Kartu Stok Header */}
                    <Card className="mb-6 bg-gradient-to-r from-[#005DA6] to-[#00457C] text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold">{report.barang}</h2>
                                <p className="text-blue-200 mt-1">
                                    Satuan: {report.satuan} | Periode: All Time
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-200 text-sm">Metode</p>
                                <p className="text-2xl font-bold">FIFO</p>
                            </div>
                        </div>
                    </Card>

                    {/* Batch Table */}
                    <Card className="mb-6 overflow-hidden">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FiCalendar className="w-5 h-5 text-[#005DA6]" />
                            Detail Batch Stok
                        </h3>

                        {report.report.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Belum ada batch stok untuk barang ini</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                                                    No
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                                                    Tanggal Masuk
                                                </th>
                                                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                                                    Jenis
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                                                    Jumlah Awal
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                                                    Sisa
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                                                    Harga Satuan
                                                </th>
                                                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                                                    Total Nilai
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {batchesToShow.map((batch, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={`hover:bg-gray-50 transition-colors ${batch.sisaJumlah === 0 ? "opacity-50" : ""
                                                        }`}
                                                >
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800">
                                                        {formatDate(batch.tanggalMasuk)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`
                                                                inline-flex px-2 py-1 text-xs font-medium rounded-full
                                                                ${batch.jenisTransaksi === "PEMBELIAN"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : batch.jenisTransaksi === "HIBAH"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : batch.jenisTransaksi === "SALDO_AWAL"
                                                                            ? "bg-gray-100 text-gray-700"
                                                                            : "bg-purple-100 text-purple-700"
                                                                }
                                                            `}
                                                        >
                                                            {LABEL_TRANSAKSI[batch.jenisTransaksi as keyof typeof LABEL_TRANSAKSI] ||
                                                                batch.jenisTransaksi}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                                                        {batch.jumlah}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span
                                                            className={`font-medium ${batch.sisaJumlah === 0
                                                                ? "text-red-500"
                                                                : batch.sisaJumlah < batch.jumlah
                                                                    ? "text-orange-500"
                                                                    : "text-green-600"
                                                                }`}
                                                        >
                                                            {batch.sisaJumlah}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-800">
                                                        {formatRupiah(batch.hargaSatuan)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                                        {formatRupiah(batch.totalNilai)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-semibold">
                                            <tr>
                                                <td colSpan={3} className="px-4 py-3 text-gray-700">
                                                    TOTAL
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {report.report.reduce((s, r) => s + r.jumlah, 0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-green-700">
                                                    {summary?.totalStok}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-500">-</td>
                                                <td className="px-4 py-3 text-right text-[#005DA6]">
                                                    {formatRupiah(summary?.totalNilai || 0)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {/* Show More Button */}
                                {report.report.length > 10 && (
                                    <button
                                        onClick={() => setShowAllBatches(!showAllBatches)}
                                        className="flex items-center gap-2 mt-4 text-[#005DA6] hover:underline text-sm font-medium"
                                    >
                                        {showAllBatches ? (
                                            <>
                                                <FiChevronDown className="w-4 h-4" />
                                                Sembunyikan ({report.report.length - 10} batch)
                                            </>
                                        ) : (
                                            <>
                                                <FiChevronRight className="w-4 h-4" />
                                                Tampilkan semua ({report.report.length} batch)
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </Card>

                    {/* Info FIFO */}
                    <Card className="bg-blue-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                            ℹ️ Tentang Metode FIFO
                        </h4>
                        <p className="text-sm text-blue-700">
                            <strong>First In, First Out</strong> - Barang yang masuk lebih dulu akan
                            keluar lebih dulu. Sisa stok yang ditampilkan adalah stok yang masih
                            tersedia dari setiap batch pengadaan. Total nilai dihitung dari sisa
                            stok × harga satuan masing-masing batch.
                        </p>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {!selectedBarang && !loading && (
                <Card className="text-center py-16">
                    <FiBarChart2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Pilih Barang untuk Melihat Laporan
                    </h3>
                    <p className="text-gray-500">
                        Laporan FIFO akan menampilkan detail batch stok dan nilai persediaan
                    </p>
                </Card>
            )}
        </div>
    );
}
