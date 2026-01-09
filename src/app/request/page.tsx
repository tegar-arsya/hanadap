"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSend, FiPackage, FiUser, FiInfo, FiGrid } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

interface Barang {
  id: string;
  nama: string;
  satuan: string;
  stokTotal: number;
}

interface UnitKerja {
  id: string;
  nama: string;
  kode: string;
}

interface RequestItem {
  barangId: string;
  barang: Barang;
  jumlah: number;
}

const BPS = {
  blue: "#005DA6",
  darkBlue: "#00457C",
  orange: "#F7931E",
  green: "#8CC63F",
  grayBg: "#F4F7FE",
  border: "#E2E8F0",
};

export default function PublicRequestPage() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [selectedBarang, setSelectedBarang] = useState("");
  const [jumlah, setJumlah] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [namaPemohon, setNamaPemohon] = useState("");
  const [emailPemohon, setEmailPemohon] = useState("");
  const [unitKerjaId, setUnitKerjaId] = useState("");

  const showToast = (title: string, type: "success" | "error" | "warning") => {
    toaster.create({ title, type });
  };

  useEffect(() => {
    fetch("/api/barang")
      .then((res) => res.json())
      .then((data) => setBarangList(data.filter((b: Barang) => b.stokTotal > 0)))
      .catch(() => {});

    fetch("/api/unit-kerja")
      .then((res) => res.json())
      .then((data) => setUnitKerjaList(data))
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    const barang = barangList.find((b) => b.id === selectedBarang);
    if (!barang) return;

    if (items.some((i) => i.barangId === selectedBarang)) {
      showToast("Barang ini sudah ada di daftar permintaan", "warning");
      return;
    }

    setItems([...items, { barangId: selectedBarang, barang, jumlah: parseInt(jumlah) }]);
    setSelectedBarang("");
    setJumlah("1");
  };

  const handleRemoveItem = (barangId: string) => {
    setItems(items.filter((i) => i.barangId !== barangId));
  };

  const handleSubmit = async () => {
    if (!namaPemohon || !emailPemohon || !unitKerjaId) {
      showToast("Mohon lengkapi data pemohon", "warning");
      return;
    }

    if (items.length === 0) {
      showToast("Daftar barang masih kosong", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/request/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPemohon,
          emailPemohon,
          unitKerjaId,
          catatan,
          items: items.map((i) => ({ barangId: i.barangId, jumlahDiminta: i.jumlah })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Permintaan berhasil diajukan!", "success");
        setItems([]);
        setCatatan("");
        setNamaPemohon("");
        setEmailPemohon("");
        setUnitKerjaId("");
        window.location.href = `/tracking?id=${data.id}`;
      } else {
        const error = await res.json();
        showToast(error.error || "Gagal mengajukan permintaan", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] relative">
      {/* Background Header */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "280px",
          background: `linear-gradient(135deg, ${BPS.blue} 0%, ${BPS.darkBlue} 100%)`,
          zIndex: 0,
        }}
      >
        <div className="absolute bottom-0 inset-x-0 h-[60px] bg-[#F4F7FE] rounded-t-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col gap-8">
          {/* HEADER */}
          <div className="text-white pt-4">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex-1">
                <span className="inline-flex bg-white/20 text-white px-3 py-1.5 mb-4 rounded-full text-xs font-semibold tracking-wide">
                  FORMULIR DIGITAL 01
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Permintaan Barang</h1>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-2xl">
                  Isi formulir di bawah untuk mengajukan kebutuhan ATK atau peralatan kerja unit Anda. Permintaan akan diproses sesuai ketersediaan stok.
                </p>
              </div>
              <div className="hidden md:block bg-white/20 p-5 rounded-2xl backdrop-blur">
                <FiPackage size={48} />
              </div>
            </div>
          </div>

          {/* MAIN CARD */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* 1. DATA PEMOHON */}
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <FiUser size={20} color={BPS.blue} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Identitas Pemohon</h2>
                  <p className="text-sm text-gray-500 mt-1">Lengkapi informasi diri Anda</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Dinas</label>
                  <input
                    type="email"
                    value={emailPemohon}
                    onChange={(e) => setEmailPemohon(e.target.value)}
                    placeholder="email@bps.go.id"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Kerja</label>
                <select
                  value={unitKerjaId}
                  onChange={(e) => setUnitKerjaId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition bg-white"
                >
                  <option value="">Pilih unit kerja asal...</option>
                  {unitKerjaList.map((uk) => (
                    <option key={uk.id} value={uk.id}>
                      {uk.nama} — Kode: {uk.kode}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* 2. INPUT BARANG */}
            <div className="p-6 md:p-8 bg-blue-50/50">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-lg shadow-sm">
                    <FiGrid size={20} color={BPS.blue} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Pilih Barang</h2>
                    <p className="text-sm text-gray-500 mt-1">Tambahkan item yang dibutuhkan</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-sm font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  ✓ Stok Tersedia
                </span>
              </div>

              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Barang</label>
                  <select
                    value={selectedBarang}
                    onChange={(e) => setSelectedBarang(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition bg-white"
                  >
                    <option value="">Cari dan pilih barang...</option>
                    {barangList.map((barang) => (
                      <option key={barang.id} value={barang.id}>
                        {barang.nama} — Tersedia: {barang.stokTotal} {barang.satuan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full lg:w-[140px]">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition bg-white"
                  />
                </div>

                <button
                  onClick={handleAddItem}
                  disabled={!selectedBarang}
                  className={`w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 rounded-lg font-semibold text-white transition transform ${
                    selectedBarang
                      ? "bg-[#005DA6] hover:bg-[#00457C] hover:-translate-y-0.5 shadow-md"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  <FiPlus />
                  Tambahkan
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* 3. DAFTAR BARANG */}
            <div>
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-gray-500 bg-gray-50">
                  <div className="bg-gray-100 p-6 rounded-2xl mb-2">
                    <FiPackage size={48} className="opacity-50" />
                  </div>
                  <p className="text-md font-medium text-gray-600">Belum ada barang yang ditambahkan</p>
                  <p className="text-sm text-gray-400">Pilih barang di atas untuk menambahkan ke daftar permintaan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-700 font-semibold">
                        <th className="py-4 px-6">Nama Barang</th>
                        <th className="py-4 px-6 text-center">Jumlah</th>
                        <th className="py-4 px-6">Satuan</th>
                        <th className="py-4 px-6 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, idx) => (
                        <tr key={item.barangId} className="bg-white hover:bg-gray-50 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#005DA6] flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </div>
                              <span className="text-gray-800 font-medium">{item.barang.nama}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                              {item.jumlah}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{item.barang.satuan}</td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => handleRemoveItem(item.barangId)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                              aria-label="Hapus"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200" />

            {/* 4. CATATAN & SUBMIT */}
            <div className="p-6 md:p-8 bg-gray-50">
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <span className="inline-flex items-center gap-2">
                    <FiInfo size={18} color={BPS.blue} />
                    Catatan Tambahan (Opsional)
                  </span>
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                  placeholder="Contoh: Mohon diproses segera untuk kegiatan sensus minggu depan. Terima kasih."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#005DA6] focus:ring-2 focus:ring-[#005DA6]/30 transition bg-white resize-none text-sm"
                />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1 text-gray-600">
                  <p className="text-sm font-medium">📋 Total Item: {items.length} barang</p>
                  <p className="text-xs text-gray-500">Pastikan semua data sudah benar sebelum mengirim</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={items.length === 0 || !namaPemohon || !emailPemohon || !unitKerjaId || loading}
                  className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-10 h-14 rounded-xl font-bold text-white shadow-lg transition transform ${
                    items.length === 0 || !namaPemohon || !emailPemohon || !unitKerjaId || loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#F7931E] hover:bg-[#D87C10] hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? "Mengirim Permintaan..." : (
                    <>
                      <FiSend />
                      Kirim Permintaan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="text-center py-8 bg-white rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 mb-2">Sudah mengajukan permintaan sebelumnya?</p>
            <button className="inline-flex items-center gap-2 text-[#005DA6] font-semibold hover:text-[#00457C]">
              Lacak Status Permintaan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}