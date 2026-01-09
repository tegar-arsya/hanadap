"use client";

import { useState, useEffect, Fragment } from "react";
import { toaster } from "@/components/ui/toaster";
import { Modal } from "@/components/ui/shared";
import {
    FiPlus,
    FiTrash2,
    FiPackage,
    FiChevronDown,
    FiChevronRight,
    FiSearch,
    FiFilter,
} from "react-icons/fi";

// --- TIPE DATA ---
interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    stokMinimum: number;
    kategori?: { nama: string };
    batches: {
        id: string;
        jumlah: number;
        sisaJumlah: number;
        tanggalMasuk: string;
        hargaSatuan?: number
    }[];
}

export default function AdminStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [kategoriList, setKategoriList] = useState<{ id: string; nama: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isStokOpen, setIsStokOpen] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Form states
    const [nama, setNama] = useState("");
    const [satuan, setSatuan] = useState("");
    const [stokMinimum, setStokMinimum] = useState("10");
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [jumlahStok, setJumlahStok] = useState("");
    const [hargaSatuan, setHargaSatuan] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split("T")[0]);
    const [kategoriId, setKategoriId] = useState("");

    const fetchBarang = async () => {
        try {
            const res = await fetch("/api/barang");
            const data = await res.json();
            setBarangList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching barang:", error);
            setBarangList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchKategori = async () => {
        try {
            const res = await fetch("/api/kategori");
            const data = await res.json();
            setKategoriList(data);
        } catch (error) {
            console.error("Error fetching kategori:", error);
        }
    };

    useEffect(() => {
        fetchBarang();
        fetchKategori();
    }, []);

    const handleAddBarang = async () => {
        if (!nama || !satuan) {
            toaster.create({ title: "Nama dan Satuan wajib diisi", type: "error" });
            return;
        }
        try {
            await fetch("/api/barang", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama,
                    satuan,
                    stokMinimum: parseInt(stokMinimum),
                    kategoriId: kategoriId || null,
                }),
            });
            toaster.create({ title: "Barang berhasil ditambahkan", type: "success" });
            setNama(""); setSatuan(""); setStokMinimum("10"); setKategoriId(""); setIsOpen(false);
            fetchBarang();
        } catch (error) {
            toaster.create({ title: "Gagal menambah barang", type: "error" });
        }
    };

    const handleAddStok = async () => {
        if (!selectedBarang || !jumlahStok) {
            toaster.create({ title: "Jumlah stok wajib diisi", type: "error" });
            return;
        }
        try {
            await fetch("/api/stok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId: selectedBarang.id,
                    jumlah: parseInt(jumlahStok),
                    hargaSatuan: hargaSatuan ? parseInt(hargaSatuan) : 0,
                    tanggalMasuk,
                }),
            });
            toaster.create({ title: "Stok berhasil ditambahkan", type: "success" });
            setJumlahStok(""); setHargaSatuan(""); setIsStokOpen(false);
            fetchBarang();
        } catch (error) {
            toaster.create({ title: "Gagal menambah stok", type: "error" });
        }
    };

    const handleDeleteBarang = async (id: string) => {
        if (!confirm("Yakin ingin menghapus barang ini beserta seluruh riwayat stoknya?")) return;
        try {
            await fetch(`/api/barang/${id}`, { method: "DELETE" });
            toaster.create({ title: "Barang berhasil dihapus", type: "success" });
            fetchBarang();
        } catch (error) {
            toaster.create({ title: "Gagal menghapus barang", type: "error" });
        }
    };

    const toggleExpanded = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    const filteredBarang = barangList.filter((b) =>
        b.nama.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (stokTotal: number, stokMinimum: number) => {
        if (stokTotal <= 0) return { color: "bg-red-100 text-red-700", label: "Habis" };
        if (stokTotal <= stokMinimum) return { color: "bg-orange-100 text-orange-700", label: "Menipis" };
        return { color: "bg-green-100 text-green-700", label: "Aman" };
    };

    return (
        <div>
            {/* HEADER PAGE */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Manajemen Stok</h1>
                    <p className="text-gray-600">Daftar inventaris barang dan pencatatan stok masuk.</p>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#005DA6] text-white rounded-lg font-medium hover:bg-[#00457C] transition-all shadow-sm hover:-translate-y-0.5"
                >
                    <FiPlus className="w-4 h-4" />
                    Tambah Barang
                </button>
            </div>

            {/* FILTER & SEARCH */}
            <div className="bg-white rounded-lg shadow-md p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border-2 border-gray-200 focus-within:border-[#005DA6] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all">
                            <FiSearch className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama barang..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                        <FiFilter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* TABLE DATA */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b-2 border-gray-200">
                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">BARANG</th>
                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">KATEGORI</th>
                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">SATUAN</th>
                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">TOTAL STOK</th>
                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">MIN. STOK</th>
                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">STATUS</th>
                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBarang.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <FiPackage className="w-12 h-12" />
                                            <span className="text-lg">Data barang tidak ditemukan.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBarang.map((barang) => {
                                    const isExpanded = expanded.has(barang.id);
                                    const status = getStatusBadge(barang.stokTotal, barang.stokMinimum);

                                    return (
                                        <Fragment key={barang.id}>
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 font-semibold text-gray-900">{barang.nama}</td>
                                                <td className="px-4 py-4 text-gray-600">{barang.kategori?.nama || "-"}</td>
                                                <td className="px-4 py-4 text-gray-600">{barang.satuan}</td>
                                                <td className="px-4 py-4 text-right font-bold text-gray-900">{barang.stokTotal}</td>
                                                <td className="px-4 py-4 text-right text-gray-600">{barang.stokMinimum}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => toggleExpanded(barang.id)}
                                                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                                        >
                                                            {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedBarang(barang); setIsStokOpen(true); }}
                                                            className="px-4 py-1.5 text-sm bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors"
                                                        >
                                                            + Stok
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteBarang(barang.id)}
                                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* DETAIL BATCH (EXPANDED ROW) */}
                                            {isExpanded && (
                                                <tr className="bg-blue-50">
                                                    <td colSpan={7} className="p-5">
                                                        <div className="bg-white rounded-md shadow-sm p-4">
                                                            <h4 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
                                                                Riwayat Stok Masuk (FIFO)
                                                            </h4>
                                                            {barang.batches && barang.batches.length > 0 ? (
                                                                <table className="w-full">
                                                                    <thead>
                                                                        <tr className="bg-gray-50">
                                                                            <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Tgl Masuk</th>
                                                                            <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Awal</th>
                                                                            <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Sisa</th>
                                                                            <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600">Harga/Unit</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {barang.batches.map(batch => (
                                                                            <tr key={batch.id}>
                                                                                <td className="px-3 py-2 text-sm text-gray-700">{formatDate(batch.tanggalMasuk)}</td>
                                                                                <td className="px-3 py-2 text-sm text-gray-600 text-right">{batch.jumlah}</td>
                                                                                <td className="px-3 py-2 text-sm text-right font-semibold text-[#005DA6]">{batch.sisaJumlah}</td>
                                                                                <td className="px-3 py-2 text-sm text-gray-600 text-right">
                                                                                    {batch.hargaSatuan ? `Rp ${batch.hargaSatuan.toLocaleString()}` : '-'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">Belum ada data batch stok.</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL TAMBAH BARANG --- */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Tambah Barang Baru"
                size="lg"
                footer={
                    <>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAddBarang}
                            className="px-6 py-2.5 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors"
                        >
                            Simpan
                        </button>
                    </>
                }
            >
                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nama Barang <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Kertas A4"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Satuan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Rim, Pcs..."
                                value={satuan}
                                onChange={(e) => setSatuan(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Stok Minimum
                            </label>
                            <input
                                type="number"
                                value={stokMinimum}
                                onChange={(e) => setStokMinimum(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Kategori
                        </label>
                        <select
                            value={kategoriId}
                            onChange={(e) => setKategoriId(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all bg-white"
                        >
                            <option value="">Pilih kategori...</option>
                            {kategoriList.map((k) => (
                                <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Modal>

            {/* --- MODAL TAMBAH STOK --- */}
            <Modal
                isOpen={isStokOpen}
                onClose={() => setIsStokOpen(false)}
                title={`Tambah Stok: ${selectedBarang?.nama || ""}`}
                size="lg"
                footer={
                    <>
                        <button
                            onClick={() => setIsStokOpen(false)}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleAddStok}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Tambah Stok
                        </button>
                    </>
                }
            >
                <div className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Jumlah Masuk <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            value={jumlahStok}
                            onChange={(e) => setJumlahStok(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Harga Satuan (Opsional)
                        </label>
                        <input
                            type="number"
                            placeholder="Rp 0"
                            value={hargaSatuan}
                            onChange={(e) => setHargaSatuan(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tanggal Masuk
                        </label>
                        <input
                            type="date"
                            value={tanggalMasuk}
                            onChange={(e) => setTanggalMasuk(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#005DA6] focus:shadow-[0_0_0_3px_rgba(0,93,166,0.1)] transition-all"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}