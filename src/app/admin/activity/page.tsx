"use client";

import { useState, useEffect } from "react";
import styles from "./activity.module.css";

interface ActivityLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    description: string;
    createdAt: string;
    user: { nama: string; email: string };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const ACTION_COLORS: Record<string, string> = {
    LOGIN: "#3b82f6",
    CREATE: "#22c55e",
    UPDATE: "#f59e0b",
    DELETE: "#ef4444",
    APPROVE: "#10b981",
    REJECT: "#dc2626",
    RETURN: "#8b5cf6",
};

const ENTITIES = ["", "User", "Barang", "Request", "StockBatch", "Kategori", "UnitKerja"];

export default function AdminActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState("");
    const [page, setPage] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            if (entityFilter) params.set("entity", entityFilter);

            const res = await fetch(`/api/activity-log?${params}`);
            const data = await res.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, entityFilter]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Activity Log</h1>
                    <p className={styles.subtitle}>Riwayat aktivitas pengguna sistem</p>
                </div>
            </div>

            <div className={styles.filters}>
                <select
                    value={entityFilter}
                    onChange={(e) => {
                        setEntityFilter(e.target.value);
                        setPage(1);
                    }}
                    className={styles.select}
                >
                    <option value="">Semua Entity</option>
                    {ENTITIES.filter(Boolean).map((entity) => (
                        <option key={entity} value={entity}>
                            {entity}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className={styles.loading}>Memuat...</div>
            ) : logs.length === 0 ? (
                <div className={styles.empty}>Belum ada aktivitas tercatat</div>
            ) : (
                <>
                    <div className={styles.timeline}>
                        {logs.map((log) => (
                            <div key={log.id} className={styles.logItem}>
                                <div
                                    className={styles.actionBadge}
                                    style={{ backgroundColor: ACTION_COLORS[log.action] || "#666" }}
                                >
                                    {log.action}
                                </div>
                                <div className={styles.logContent}>
                                    <div className={styles.logDescription}>{log.description}</div>
                                    <div className={styles.logMeta}>
                                        <span className={styles.logUser}>{log.user.nama}</span>
                                        <span className={styles.logEntity}>{log.entity}</span>
                                        <span className={styles.logTime}>{formatDate(log.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                ← Sebelumnya
                            </button>
                            <span className={styles.pageInfo}>
                                Halaman {pagination.page} dari {pagination.totalPages}
                            </span>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                Selanjutnya →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
