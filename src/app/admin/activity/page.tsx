"use client";

import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { PageHeader, Card, EmptyStateBox } from "@/components/ui/shared";

interface ActivityLog {
    id: string;
    action: string;
    entity: string;
    description: string;
    createdAt: string;
    user: { nama: string };
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    LOGIN: { bg: "bg-blue-100", text: "text-blue-700" },
    CREATE: { bg: "bg-green-100", text: "text-green-700" },
    UPDATE: { bg: "bg-orange-100", text: "text-orange-700" },
    DELETE: { bg: "bg-red-100", text: "text-red-700" },
    APPROVE: { bg: "bg-green-100", text: "text-green-700" },
    REJECT: { bg: "bg-red-100", text: "text-red-700" },
    RETURN: { bg: "bg-purple-100", text: "text-purple-700" },
};

const ENTITIES = ["User", "Barang", "Request", "StockBatch", "Kategori", "UnitKerja"];

export default function AdminActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString() });
        if (entityFilter) params.set("entity", entityFilter);
        const res = await fetch(`/api/activity-log?${params}`);
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
    };

    useEffect(() => { fetchLogs(); }, [page, entityFilter]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const getActionStyle = (action: string) => ACTION_COLORS[action] || { bg: "bg-gray-100", text: "text-gray-700" };

    return (
        <div>
            <PageHeader title="Activity Log" description="Riwayat aktivitas pengguna sistem" />

            <div className="mb-6">
                <Card>
                    <select
                        value={entityFilter}
                        onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                        className="max-w-[250px] px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm bg-white"
                    >
                        <option value="">Semua Entity</option>
                        {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                </Card>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : logs.length === 0 ? (
                <EmptyStateBox
                    title="Belum ada aktivitas"
                    description="Tidak ada data aktivitas yang tersedia."
                />
            ) : (
                <div className="flex flex-col gap-3">
                    {logs.map((log) => {
                        const style = getActionStyle(log.action);
                        return (
                            <Card key={log.id}>
                                <div className="flex gap-4 items-start">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                                        {log.action}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800">{log.description}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span className="font-medium">{log.user.nama}</span>
                                            <span>•</span>
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{log.entity}</span>
                                            <span>•</span>
                                            <span>{formatDate(log.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiChevronLeft className="w-4 h-4" />
                        Sebelumnya
                    </button>
                    <span className="text-sm text-gray-500">
                        Halaman {page} dari {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Selanjutnya
                        <FiChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
