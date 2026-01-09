"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FiPackage,
    FiLayers,
    FiClock,
    FiCheckCircle,
    FiTrendingUp,
    FiArrowRight
} from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

interface DashboardData {
    totalBarang: number;
    totalStok: number;
    pendingRequests: number;
    approvedRequests: number;
    recentRequests: any[];
}

// --- SKELETON COMPONENT ---
function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

// --- STAT CARD COMPONENT ---
interface StatCardProps {
    label: string;
    value?: number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    helpText: string;
    loading?: boolean;
}

function DashboardStatCard({ label, value, icon, iconBg, iconColor, helpText, loading }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    {loading ? (
                        <Skeleton className="h-8 w-3/5 mt-2 mb-1" />
                    ) : (
                        <h3 className="text-3xl font-bold text-gray-800 mt-2 mb-1">
                            {value?.toLocaleString('id-ID') ?? 0}
                        </h3>
                    )}
                    <p className="text-xs text-gray-400">{helpText}</p>
                </div>
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// --- STATUS BADGE COMPONENT ---
function StatusBadge({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        PENDING: "bg-orange-100 text-orange-700",
    };

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorMap[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/dashboard");
                if (!res.ok) throw new Error("Gagal mengambil data");
                const json = await res.json();
                setData(json);
            } catch (error) {
                toaster.create({ title: "Gagal memuat dashboard", type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {/* --- HEADER SECTION --- */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Selamat datang kembali di Sistem Logistik BARANGMU.</p>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <DashboardStatCard
                    loading={loading}
                    label="Total Aset Barang"
                    value={data?.totalBarang}
                    icon={<FiPackage className="w-6 h-6" />}
                    iconColor="text-[#005DA6]"
                    iconBg="bg-blue-50"
                    helpText="Jenis barang terdaftar"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Total Stok Unit"
                    value={data?.totalStok}
                    icon={<FiLayers className="w-6 h-6" />}
                    iconColor="text-purple-500"
                    iconBg="bg-purple-50"
                    helpText="Akumulasi seluruh stok"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Menunggu Persetujuan"
                    value={data?.pendingRequests}
                    icon={<FiClock className="w-6 h-6" />}
                    iconColor="text-orange-500"
                    iconBg="bg-orange-50"
                    helpText="Perlu tindakan segera"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Permintaan Selesai"
                    value={data?.approvedRequests}
                    icon={<FiCheckCircle className="w-6 h-6" />}
                    iconColor="text-green-500"
                    iconBg="bg-green-50"
                    helpText="Total disetujui bulan ini"
                />
            </div>

            {/* --- RECENT ACTIVITY SECTION --- */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Kolom Kiri: Tabel Recent Request */}
                <div className="flex-[2] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <FiTrendingUp className="w-5 h-5 text-[#005DA6]" />
                            <h2 className="text-lg font-semibold text-gray-800">Permintaan Terbaru</h2>
                        </div>
                        <Link
                            href="/admin/request"
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">ID & Tanggal</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Pemohon</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    [1, 2, 3].map((i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                                            <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                                            <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                                            <td className="px-4 py-3"><Skeleton className="h-5 w-8" /></td>
                                        </tr>
                                    ))
                                ) : data?.recentRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                            Belum ada data permintaan.
                                        </td>
                                    </tr>
                                ) : (
                                    data?.recentRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <span className="font-medium text-xs text-gray-800">{req.id.substring(0, 8)}...</span>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-800">{req.user?.nama || 'Unknown'}</span>
                                                <p className="text-xs text-gray-500">{req.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/request/${req.id}`}
                                                    className="p-2 text-gray-400 hover:text-gray-600 inline-block"
                                                >
                                                    <FiArrowRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Kolom Kanan: Quick Action */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-[#005DA6] to-[#00457C] rounded-xl p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Laporan Bulanan</h3>
                        <p className="text-sm opacity-90 mb-4">
                            Unduh rekapitulasi stok masuk dan keluar periode ini.
                        </p>
                        <button className="w-full py-2 px-4 bg-white text-[#005DA6] font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm">
                            Unduh Laporan Excel
                        </button>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Status Sistem</h4>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Server</span>
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Database</span>
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">Connected</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}