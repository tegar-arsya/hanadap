"use client";

import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiInbox } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, Modal } from "@/components/ui/shared";

interface Kategori {
    id: string;
    nama: string;
    _count?: { barang: number };
}

export default function AdminKategoriPage() {
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [nama, setNama] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const fetchKategori = async () => {
        const res = await fetch("/api/kategori");
        setKategoriList(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchKategori(); }, []);

    const handleAdd = async () => {
        if (!nama) return;
        await fetch("/api/kategori", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama }),
        });
        toaster.create({ title: "Kategori ditambahkan", type: "success" });
        setNama("");
        setIsOpen(false);
        fetchKategori();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kategori?")) return;
        await fetch(`/api/kategori/${id}`, { method: "DELETE" });
        toaster.create({ title: "Kategori dihapus", type: "info" });
        fetchKategori();
    };

    return (
        <>
            <PageHeader
                title="Kategori"
                description="Kelola kategori barang"
            >
                <PrimaryButton icon={FiPlus} onClick={() => setIsOpen(true)}>
                    Tambah Kategori
                </PrimaryButton>
            </PageHeader>

            <Card>
                <div className="overflow-x-auto -mx-5 -mb-5">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Kategori</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah Barang</th>
                                <th className="w-24 px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-sm font-medium text-gray-500">Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : kategoriList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <FiInbox className="w-12 h-12 text-gray-300" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-500">Tidak ada kategori</p>
                                                <p className="text-xs text-gray-400">Tambahkan kategori baru</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                kategoriList.map((kat, index) => (
                                    <tr key={kat.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                                        <td className="px-5 py-3 font-medium text-gray-800">{kat.nama}</td>
                                        <td className="px-5 py-3 text-right text-gray-600">{kat._count?.barang || 0}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => handleDelete(kat.id)}
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                title="Hapus"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Tambah Kategori"
                footer={
                    <>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAdd}
                            className="px-4 py-2 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors"
                        >
                            Simpan
                        </button>
                    </>
                }
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nama Kategori
                    </label>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="ATK, Elektronik, dll"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                    />
                </div>
            </Modal>
        </>
    );
}
