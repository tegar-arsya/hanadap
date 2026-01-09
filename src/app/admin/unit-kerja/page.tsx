"use client";

import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, StyledInput, Modal } from "@/components/ui/shared";

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
    quotaBulanan: number;
    _count?: { users: number };
}

export default function AdminUnitKerjaPage() {
    const [unitList, setUnitList] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState("");
    const [kode, setKode] = useState("");
    const [quota, setQuota] = useState("100");

    const fetchData = async () => {
        const res = await fetch("/api/unit-kerja");
        setUnitList(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        if (!nama || !kode) return;
        await fetch("/api/unit-kerja", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama, kode, quotaBulanan: parseInt(quota) }),
        });
        toaster.create({ title: "Unit Kerja ditambahkan", type: "success" });
        setNama(""); setKode(""); setQuota("100");
        setIsOpen(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus?")) return;
        await fetch(`/api/unit-kerja/${id}`, { method: "DELETE" });
        toaster.create({ title: "Unit Kerja dihapus", type: "info" });
        fetchData();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <PageHeader title="Unit Kerja" />
                <PrimaryButton onClick={() => setIsOpen(true)} icon={FiPlus}>
                    Tambah Unit
                </PrimaryButton>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nama Unit</th>
                                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Kode</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Quota/Bulan</th>
                                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Anggota</th>
                                <th className="w-24 px-4 py-3 text-sm font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : unitList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        Belum ada data unit kerja.
                                    </td>
                                </tr>
                            ) : (
                                unitList.map((unit, index) => (
                                    <tr key={unit.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                        <td className="px-4 py-3 font-medium text-gray-800">{unit.nama}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                                {unit.kode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">{unit.quotaBulanan}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{unit._count?.users || 0}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDelete(unit.id)}
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

            {/* Modal Tambah Unit */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Tambah Unit Kerja"
                footer={
                    <>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Batal
                        </button>
                        <PrimaryButton onClick={handleAdd}>Simpan</PrimaryButton>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nama <span className="text-red-500">*</span>
                        </label>
                        <StyledInput
                            value={nama}
                            onChange={setNama}
                            placeholder="IT Department"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Kode <span className="text-red-500">*</span>
                        </label>
                        <StyledInput
                            value={kode}
                            onChange={setKode}
                            placeholder="IT"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Quota Bulanan
                        </label>
                        <input
                            type="number"
                            value={quota}
                            onChange={(e) => setQuota(e.target.value)}
                            min={1}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
