"use client";

import { useState, useRef } from "react";
import {
    FiUpload,
    FiDownload,
    FiCheck,
    FiX,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiInfo,
} from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

// Types
interface ImportDetail {
    row: number;
    nama: string;
    status: "success" | "error";
    message: string;
}

interface ImportResult {
    message?: string;
    summary?: {
        total: number;
        success: number;
        failed: number;
        newItems: number;
    };
    details?: ImportDetail[];
    errors?: string[];
    error?: string;
}

export default function ImportPembelianPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [tahun, setTahun] = useState(new Date().getFullYear().toString());
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("tahun", tahun);

        try {
            const res = await fetch("/api/import-pembelian", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setResult(data);
            setShowDetails(true);
        } catch {
            setResult({ error: "Gagal mengupload file. Coba lagi." });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const res = await fetch("/api/import-pembelian");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Template_Import_Pembelian_BPS.xlsx";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Gagal download template");
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setResult(null);
        setShowDetails(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="max-w-5xl">
            <PageHeader
                title="Import Transaksi Pembelian"
                description="Upload file Excel sesuai format SAKTI BPS untuk import data pembelian barang"
            />

            {/* Info Format */}
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FiInfo className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Format File Excel
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Gunakan format sesuai dengan data SAKTI BPS. Kolom yang didukung:
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white/50">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                            Kolom
                                        </th>
                                        <th className="text-center px-3 py-2 font-semibold text-gray-700">
                                            Wajib
                                        </th>
                                        <th className="text-left px-3 py-2 font-semibold text-gray-700">
                                            Contoh
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-blue-100">
                                    <tr>
                                        <td className="px-3 py-2">
                                            <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                                                Bulan Pembukuan di SAKTI
                                            </code>
                                        </td>
                                        <td className="text-center px-3 py-2">
                                            <FiX className="inline text-gray-400" />
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            Februari, Mei, Oktober
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">
                                            <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-700">
                                                Jenis Transaksi
                                            </code>
                                        </td>
                                        <td className="text-center px-3 py-2">
                                            <FiX className="inline text-gray-400" />
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            Pembelian, Hibah
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">
                                            <code className="bg-green-100 px-2 py-0.5 rounded text-green-700">
                                                Nama Barang
                                            </code>
                                        </td>
                                        <td className="text-center px-3 py-2">
                                            <FiCheck className="inline text-green-500" />
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            Kertas HVS F4 70 gram
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">
                                            <code className="bg-green-100 px-2 py-0.5 rounded text-green-700">
                                                Jumlah Barang
                                            </code>
                                        </td>
                                        <td className="text-center px-3 py-2">
                                            <FiCheck className="inline text-green-500" />
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            145, 5, 24
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-3 py-2">
                                            <code className="bg-green-100 px-2 py-0.5 rounded text-green-700">
                                                Harga Satuan
                                            </code>
                                        </td>
                                        <td className="text-center px-3 py-2">
                                            <FiCheck className="inline text-green-500" />
                                        </td>
                                        <td className="px-3 py-2 text-gray-600">
                                            60000 atau 60.000
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 mt-4 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                        >
                            <FiDownload className="w-4 h-4" />
                            Download Template Excel
                        </button>
                    </div>
                </div>
            </Card>

            {/* Upload Section */}
            <Card className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiUpload className="w-5 h-5 text-[#005DA6]" />
                    Upload File
                </h3>

                {/* Tahun Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun Pembukuan
                    </label>
                    <select
                        value={tahun}
                        onChange={(e) => setTahun(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                        Bulan pembukuan akan dikonversi ke tanggal di tahun ini
                    </p>
                </div>

                {/* Drop Zone */}
                <div
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                        ${selectedFile
                            ? "border-green-400 bg-green-50"
                            : "border-gray-300 bg-gray-50 hover:border-[#005DA6] hover:bg-blue-50"
                        }
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={loading}
                    />
                    {selectedFile ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FiFileText className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <FiUpload className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">
                                    Klik atau drag file Excel ke sini
                                </p>
                                <p className="text-sm text-gray-500">
                                    Format: .xlsx atau .xls
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || loading}
                        className={`
                            flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
                            ${selectedFile && !loading
                                ? "bg-[#005DA6] text-white hover:bg-[#004a85]"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }
                        `}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <FiUpload className="w-4 h-4" />
                                Import Data
                            </>
                        )}
                    </button>
                    {selectedFile && !loading && (
                        <button
                            onClick={resetForm}
                            className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </Card>

            {/* Results */}
            {result && (
                <Card className="mb-6">
                    {result.error ? (
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="p-2 bg-red-100 rounded-full">
                                <FiAlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-red-800">Import Gagal</p>
                                <p className="text-sm text-red-600 mt-1">{result.error}</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div
                                className={`
                                    flex items-start gap-3 p-4 rounded-lg border mb-4
                                    ${result.summary?.failed === 0
                                        ? "bg-green-50 border-green-200"
                                        : "bg-orange-50 border-orange-200"
                                    }
                                `}
                            >
                                <div
                                    className={`p-2 rounded-full ${result.summary?.failed === 0
                                        ? "bg-green-100"
                                        : "bg-orange-100"
                                        }`}
                                >
                                    {result.summary?.failed === 0 ? (
                                        <FiCheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <FiAlertCircle className="w-5 h-5 text-orange-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-800">
                                        Import Selesai
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                                            Total: {result.summary?.total}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                                            <FiCheck className="w-3 h-3 mr-1" />
                                            Berhasil: {result.summary?.success}
                                        </span>
                                        {result.summary?.failed !== undefined &&
                                            result.summary.failed > 0 && (
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                                                    <FiX className="w-3 h-3 mr-1" />
                                                    Gagal: {result.summary?.failed}
                                                </span>
                                            )}
                                        {result.summary?.newItems !== undefined &&
                                            result.summary.newItems > 0 && (
                                                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                                                    Barang Baru: {result.summary?.newItems}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Toggle */}
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-sm text-[#005DA6] hover:underline mb-3"
                            >
                                {showDetails ? "Sembunyikan Detail" : "Lihat Detail"}
                            </button>

                            {/* Details Table */}
                            {showDetails && result.details && result.details.length > 0 && (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">
                                                    Baris
                                                </th>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">
                                                    Nama Barang
                                                </th>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">
                                                    Status
                                                </th>
                                                <th className="text-left px-4 py-2 font-semibold text-gray-600">
                                                    Keterangan
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {result.details.map((detail, idx) => (
                                                <tr
                                                    key={idx}
                                                    className={
                                                        detail.status === "error"
                                                            ? "bg-red-50"
                                                            : ""
                                                    }
                                                >
                                                    <td className="px-4 py-2 text-gray-600">
                                                        {detail.row}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-800 font-medium">
                                                        {detail.nama}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {detail.status === "success" ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                <FiCheck className="w-4 h-4" />
                                                                Berhasil
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600">
                                                                <FiX className="w-4 h-4" />
                                                                Gagal
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600">
                                                        {detail.message}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </Card>
            )}

            {/* Tips */}
            <Card className="bg-gray-50 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">💡 Tips Import</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>
                        • Pastikan nama kolom sesuai dengan format (case-insensitive)
                    </li>
                    <li>
                        • Jika nama barang belum ada, sistem akan otomatis membuat barang
                        baru
                    </li>
                    <li>
                        • Format harga bisa dengan titik (60.000) atau tanpa (60000)
                    </li>
                    <li>
                        • Bulan pembukuan akan dikonversi ke tanggal 1 bulan tersebut
                    </li>
                    <li>
                        • Setelah import, data akan muncul di menu Stok sebagai batch baru
                    </li>
                </ul>
            </Card>
        </div>
    );
}
