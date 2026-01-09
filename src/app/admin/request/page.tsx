"use client";

import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { FiCheck, FiX, FiClipboard, FiClock } from "react-icons/fi";
import Swal from "sweetalert2";

// --- TIPE DATA ---
interface RequestItem {
  id: string;
  jumlahDiminta: number;
  jumlahDisetujui: number;
  barang: { id: string; nama: string; satuan: string; stokTotal: number };
}

interface Request {
  id: string;
  status: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  user: { nama: string; email: string; unitKerja?: { nama: string; kode: string } };
  items: RequestItem[];
}

export default function AdminRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/request");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (request: Request, action: "approve" | "reject") => {
    if (processingId) return;

    const result = await Swal.fire({
      title: action === "approve" ? "Setujui Permintaan?" : "Tolak Permintaan?",
      text: action === "approve"
        ? "Stok barang akan berkurang sesuai jumlah yang disetujui."
        : "Permintaan ini akan ditandai sebagai ditolak.",
      icon: action === "approve" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: action === "approve" ? "#8CC63F" : "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: action === "approve" ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setProcessingId(request.id);

    try {
      const status = action === "approve" ? "APPROVED" : "REJECTED";
      const approvedItems = action === "approve"
        ? request.items.map((item) => ({
          id: item.id,
          barangId: item.barang.id,
          barangNama: item.barang.nama,
          jumlahDiminta: item.jumlahDiminta,
          jumlahDisetujui: item.jumlahDiminta,
        }))
        : [];

      const res = await fetch("/api/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, status, approvedItems }),
      });

      if (res.ok) {
        Swal.fire({
          title: "Berhasil!",
          text: action === "approve" ? "Permintaan telah disetujui." : "Permintaan telah ditolak.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        fetchRequests();
      } else {
        const error = await res.json();
        toaster.create({ title: error.error || "Gagal memproses", type: "error" });
      }
    } catch (error) {
      toaster.create({ title: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  // --- KOMPONEN KARTU REQUEST ---
  const RequestCard = ({ request, showActions = false }: { request: Request; showActions?: boolean }) => {
    const getStatusBadge = () => {
      if (request.status === "PENDING") return { color: "bg-orange-100 text-orange-700", icon: <FiClock className="w-3 h-3 mr-1" />, label: "Menunggu" };
      if (request.status === "APPROVED") return { color: "bg-green-100 text-green-700", icon: <FiCheck className="w-3 h-3 mr-1" />, label: "Disetujui" };
      return { color: "bg-red-100 text-red-700", icon: <FiX className="w-3 h-3 mr-1" />, label: "Ditolak" };
    };

    const status = getStatusBadge();

    return (
      <div className={`bg-white rounded-lg shadow-md ${showActions ? "border-l-4 border-orange-500" : "border border-gray-200"}`}>
        <div className="p-5">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#005DA6] text-white flex items-center justify-center text-sm font-semibold">
                {request.user.nama.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{request.user.nama}</p>
                <p className="text-sm text-gray-500">{request.user.email}</p>
                {request.user.unitKerja && (
                  <span className="inline-flex mt-1 px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                    {request.user.unitKerja.nama}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                {status.icon}
                {status.label}
              </span>
              <span className="text-xs text-gray-400">{formatDate(request.createdAt)}</span>
            </div>
          </div>

          {/* Tabel Barang */}
          <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-sm font-semibold text-gray-600">Barang</th>
                  <th className="text-right px-3 py-2 text-sm font-semibold text-gray-600">Diminta</th>
                  <th className="text-right px-3 py-2 text-sm font-semibold text-gray-600">Stok Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {request.items.map((item, index) => {
                  const isStokAman = item.barang.stokTotal >= item.jumlahDiminta;
                  return (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-3 py-2 text-sm text-gray-800">{item.barang.nama}</td>
                      <td className="px-3 py-2 text-sm text-right font-medium">{item.jumlahDiminta} {item.barang.satuan}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${isStokAman ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {item.barang.stokTotal} {item.barang.satuan}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Catatan User */}
          {request.catatan && (
            <div className="bg-gray-50 p-3 rounded-md mb-4 border-l-4 border-gray-300">
              <p className="text-xs font-bold text-gray-500">Catatan Pemohon:</p>
              <p className="text-sm text-gray-700 italic">"{request.catatan}"</p>
            </div>
          )}

          {/* Tombol Aksi */}
          {showActions && (
            <div className="flex justify-end gap-2 pt-3 border-t border-dashed border-gray-200">
              <button
                onClick={() => handleAction(request, "reject")}
                disabled={!!processingId}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <FiX className="w-4 h-4" />
                Tolak
              </button>
              <button
                onClick={() => handleAction(request, "approve")}
                disabled={!!processingId}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />
                Setujui Permintaan
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Persetujuan Permintaan</h1>
        <p className="text-gray-500">Validasi pengajuan barang dari unit kerja.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-lg border-b border-gray-200 mb-6 inline-flex gap-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors
            ${activeTab === "pending"
              ? "text-[#005DA6] bg-blue-50 border-b-2 border-[#005DA6]"
              : "text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <FiClock className="w-4 h-4" />
          Menunggu Persetujuan
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors
            ${activeTab === "history"
              ? "text-[#005DA6] bg-blue-50 border-b-2 border-[#005DA6]"
              : "text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <FiClipboard className="w-4 h-4" />
          Riwayat Proses
        </button>
      </div>

      {/* Content */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <svg className="animate-spin h-10 w-10 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg border border-dashed border-gray-300">
              <FiCheck className="w-10 h-10 text-green-500 mb-4" />
              <p className="text-gray-500 font-medium">Semua permintaan telah diproses.</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <RequestCard key={request.id} request={request} showActions />
            ))
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="flex flex-col gap-4">
          {processedRequests.length === 0 ? (
            <div className="flex justify-center p-10 text-gray-500">Belum ada riwayat.</div>
          ) : (
            processedRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </div>
      )}
    </div>
  );
}