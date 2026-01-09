"use client";

import { useState, useRef } from "react";
import { FiUpload, FiDownload, FiCheck, FiX } from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

export default function AdminImportPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success?: number;
        failed?: number;
        message?: string;
        errors?: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import", { method: "POST", body: formData });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ message: "Gagal mengupload file" });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const downloadTemplate = () => {
        const template = "nama,satuan,stokMinimum,kategori\nKertas A4,rim,20,ATK\nPulpen,pcs,50,ATK\nTinta Printer,botol,5,Elektronik";
        const blob = new Blob([template], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_barang.csv";
        a.click();
    };

    return (
        <div>
            <PageHeader title="Import Data" description="Upload file Excel/CSV untuk import barang" />

            <Card className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Format File</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Kolom</th>
                                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Wajib</th>
                                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-2"><code className="text-[#005DA6]">nama</code></td>
                                <td className="px-4 py-2"><FiCheck className="text-green-500" /></td>
                                <td className="px-4 py-2 text-gray-600">Nama barang</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2"><code className="text-[#005DA6]">satuan</code></td>
                                <td className="px-4 py-2"><FiCheck className="text-green-500" /></td>
                                <td className="px-4 py-2 text-gray-600">Satuan (pcs, rim, dll)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2"><code className="text-[#005DA6]">stokMinimum</code></td>
                                <td className="px-4 py-2"><FiX className="text-gray-400" /></td>
                                <td className="px-4 py-2 text-gray-600">Stok minimum (default: 10)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2"><code className="text-[#005DA6]">kategori</code></td>
                                <td className="px-4 py-2"><FiX className="text-gray-400" /></td>
                                <td className="px-4 py-2 text-gray-600">Nama kategori</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 mt-4 px-4 py-2 border border-[#005DA6] text-[#005DA6] rounded-lg hover:bg-blue-50 transition-colors"
                >
                    <FiDownload className="w-4 h-4" />
                    Download Template CSV
                </button>
            </Card>

            <Card className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Upload File</h3>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-[#005DA6] transition-colors bg-gray-50">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <FiUpload className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-700">
                            {loading ? "Memproses..." : "Klik atau drag file ke sini"}
                        </p>
                        <p className="text-sm text-gray-500">Excel (.xlsx, .xls) atau CSV</p>
                    </div>
                    {loading && (
                        <div className="mt-4 h-1 bg-gray-200 rounded overflow-hidden">
                            <div className="h-full bg-[#005DA6] animate-pulse w-1/2"></div>
                        </div>
                    )}
                </div>
            </Card>

            {result && (
                <div className={`
                    p-4 rounded-lg flex items-start gap-3
                    ${result.failed === 0 ? "bg-green-100" : "bg-orange-100"}
                `}>
                    <div className={`p-2 rounded-full ${result.failed === 0 ? "bg-green-200" : "bg-orange-200"}`}>
                        {result.failed === 0 ? (
                            <FiCheck className="w-5 h-5 text-green-700" />
                        ) : (
                            <FiX className="w-5 h-5 text-orange-700" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-gray-800">{result.message}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-200 text-green-700 rounded">
                                {result.success} berhasil
                            </span>
                            {result.failed !== undefined && result.failed > 0 && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-200 text-red-700 rounded">
                                    {result.failed} gagal
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
