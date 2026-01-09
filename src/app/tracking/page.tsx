"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import {
  FiSearch,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowLeft,
  FiHash,
  FiMail,
  FiUser,
  FiCalendar
} from "react-icons/fi";

// --- KONFIGURASI WARNA BPS ---
const BPS = {
  blue: "#005DA6",
  darkBlue: "#00457C",
  orange: "#F7931E",
  green: "#8CC63F",
  grayBg: "#F4F7FE",
  border: "#E2E8F0",
};

interface RequestItem {
  id: string;
  jumlahDiminta: number;
  jumlahDisetujui: number;
  barang: { nama: string; satuan: string };
}

interface RequestData {
  id: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  user: { nama: string; email: string };
  items: RequestItem[];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const [requestId, setRequestId] = useState(searchParams.get("id") || "");
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"id" | "email">("id");

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setRequestId(id);
      handleSearchById(id);
    }
  }, [searchParams]);

  const handleSearchById = async (id: string) => {
    if (!id) {
      toaster.create({ title: "Mohon masukkan ID permintaan", type: "info" });
      return;
    }
    executeSearch(`/api/request/tracking?id=${id}`);
  };

  const handleSearchByEmail = async () => {
    if (!email) {
      toaster.create({ title: "Mohon masukkan alamat email", type: "info" });
      return;
    }
    executeSearch(`/api/request/tracking?email=${encodeURIComponent(email)}`);
  };

  const executeSearch = async (url: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : (data ? [data] : []));
      } else {
        setRequests([]);
      }
    } catch (error) {
      toaster.create({ title: "Gagal melakukan pencarian", type: "error" });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "border-l-green-500";
      case "REJECTED": return "border-l-red-500";
      default: return "border-l-orange-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full">
            <FiClock className="w-3 h-3" /> Menunggu Verifikasi
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-full">
            <FiCheckCircle className="w-3 h-3" /> Disetujui
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-full">
            <FiXCircle className="w-3 h-3" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] py-6 md:py-10 relative">
      {/* Dekorasi Header Background */}
      <div
        className="absolute inset-x-0 top-0 h-[220px] z-0 rounded-b-none md:rounded-b-3xl"
        style={{ backgroundColor: BPS.blue }}
      />

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        <div className="flex flex-col gap-8">

          {/* HEADER SECTION */}
          <div className="text-white">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
              <FiArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Lacak Permintaan</h1>
                <p className="text-blue-100 mt-2 text-sm md:text-base">
                  Pantau status persetujuan dan riwayat pengambilan barang Anda.
                </p>
              </div>
              <div className="hidden sm:flex bg-white/20 p-3 rounded-xl">
                <FiSearch className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* SEARCH CARD (TABS) */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-gray-50 p-1 border-b border-gray-200 flex">
              <button
                onClick={() => setActiveTab("id")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "id"
                    ? "bg-white text-[#005DA6] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <FiHash className="w-4 h-4" /> ID Permintaan
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "email"
                    ? "bg-white text-[#005DA6] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <FiMail className="w-4 h-4" /> Email Pemohon
              </button>
            </div>

            {/* Tabs Content */}
            <div className="p-6">
              {activeTab === "id" && (
                <div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Contoh: REQ-2024001"
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSearchById(requestId)}
                      disabled={loading}
                      className="px-8 py-3 bg-[#F7931E] text-white font-medium rounded-lg hover:bg-[#D87C10] transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "Cari"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*Masukkan ID unik yang Anda dapatkan saat pengajuan.</p>
                </div>
              )}

              {activeTab === "email" && (
                <div>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent"
                    />
                    <button
                      onClick={handleSearchByEmail}
                      disabled={loading}
                      className="px-8 py-3 bg-[#F7931E] text-white font-medium rounded-lg hover:bg-[#D87C10] transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "Cari"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">*Menampilkan semua riwayat permintaan terkait email ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* RESULTS SECTION */}
          {searched && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">Hasil Pencarian</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {loading ? (
                <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center gap-3">
                  <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-500">Sedang mengambil data...</span>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <FiPackage className="w-12 h-12" />
                    <p className="text-gray-600 font-medium">Data tidak ditemukan</p>
                    <p className="text-sm">Pastikan ID atau Email yang Anda masukkan sudah benar.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className={`bg-white shadow-md rounded-lg overflow-hidden border-l-[6px] ${getStatusBorderColor(req.status)} hover:-translate-y-0.5 hover:shadow-lg transition-all`}
                    >
                      {/* Ticket Header */}
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex px-2 py-1 text-xs font-medium border border-gray-300 text-gray-600 rounded">
                              ID: {req.id}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500 text-sm">
                              <FiCalendar className="w-3 h-3" />
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-6">
                        {/* User Info */}
                        <div className="flex items-start gap-3 mb-6">
                          <div className="p-2 bg-blue-50 text-[#005DA6] rounded-full">
                            <FiUser className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{req.user.nama}</p>
                            <p className="text-sm text-gray-500">{req.user.email}</p>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="border border-gray-200 rounded-md overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Barang</th>
                                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-600">Diminta</th>
                                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-600">Disetujui</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {req.items.map((item, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                  <td className="px-4 py-2 font-medium text-gray-700">{item.barang.nama}</td>
                                  <td className="px-4 py-2 text-right text-gray-600">{item.jumlahDiminta} {item.barang.satuan}</td>
                                  <td className={`px-4 py-2 text-right font-bold ${item.jumlahDisetujui > 0 ? "text-green-600" : "text-gray-400"}`}>
                                    {item.jumlahDisetujui > 0 ? `${item.jumlahDisetujui} ${item.barang.satuan}` : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Catatan Section */}
                        {req.catatan && (
                          <div className="mt-4 p-3 bg-orange-50 border border-dashed border-orange-200 rounded-md">
                            <p className="text-xs text-orange-700 font-bold">Catatan Pengajuan:</p>
                            <p className="text-sm text-gray-700 mt-1">"{req.catatan}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer CTA */}
          <div className="text-center pt-4 pb-8">
            <p className="text-gray-500 text-sm">
              Ingin mengajukan permintaan baru?{" "}
              <Link href="/request" className="text-[#005DA6] font-bold underline hover:text-[#00457C]">
                Klik di sini
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}