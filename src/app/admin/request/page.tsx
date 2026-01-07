"use client";

import { useState, useEffect } from "react";
import styles from "./request.module.css";

interface RequestItem {
    id: string;
    barangId: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: {
        id: string;
        nama: string;
        satuan: string;
        stokTotal: number;
    };
}

interface Request {
    id: string;
    status: string;
    catatan: string | null;
    createdAt: string;
    user: {
        nama: string;
        email: string;
    };
    items: RequestItem[];
}

export default function AdminRequestPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

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

    const handleApprove = async (request: Request) => {
        setProcessing(request.id);
        try {
            const res = await fetch("/api/request", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: request.id,
                    status: "APPROVED",
                    approvedItems: request.items.map((item) => ({
                        id: item.id,
                        barangId: item.barangId,
                        jumlahDisetujui: item.jumlahDiminta,
                        barangNama: item.barang.nama,
                    })),
                }),
            });

            if (res.ok) {
                fetchRequests();
            } else {
                const error = await res.json();
                alert(error.error || "Gagal menyetujui request");
            }
        } catch (error) {
            console.error("Error approving request:", error);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setProcessing(requestId);
        try {
            const res = await fetch("/api/request", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    status: "REJECTED",
                }),
            });

            if (res.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        } finally {
            setProcessing(null);
        }
    };

    const pendingRequests = requests.filter((r) => r.status === "PENDING");
    const processedRequests = requests.filter((r) => r.status !== "PENDING");

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Permintaan Barang</h1>
            <p className={styles.subtitle}>Kelola permintaan dari Unit Kerja</p>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Menunggu Persetujuan ({pendingRequests.length})
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className={styles.empty}>Tidak ada permintaan pending</div>
                ) : (
                    <div className={styles.requestList}>
                        {pendingRequests.map((request) => (
                            <div key={request.id} className={styles.requestCard}>
                                <div className={styles.requestHeader}>
                                    <div>
                                        <span className={styles.requester}>{request.user.nama}</span>
                                        <span className={styles.date}>
                                            {new Date(request.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <span className={`${styles.badge} ${styles.pending}`}>
                                        Pending
                                    </span>
                                </div>

                                <div className={styles.items}>
                                    {request.items.map((item) => (
                                        <div key={item.id} className={styles.item}>
                                            <span className={styles.itemName}>{item.barang.nama}</span>
                                            <span className={styles.itemQty}>
                                                {item.jumlahDiminta} {item.barang.satuan}
                                            </span>
                                            <span
                                                className={`${styles.stockInfo} ${item.barang.stokTotal >= item.jumlahDiminta
                                                        ? styles.stockOk
                                                        : styles.stockLow
                                                    }`}
                                            >
                                                (Stok: {item.barang.stokTotal})
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {request.catatan && (
                                    <div className={styles.note}>📝 {request.catatan}</div>
                                )}

                                <div className={styles.actions}>
                                    <button
                                        className={styles.approveBtn}
                                        onClick={() => handleApprove(request)}
                                        disabled={processing === request.id}
                                    >
                                        {processing === request.id ? "Memproses..." : "✓ Setujui"}
                                    </button>
                                    <button
                                        className={styles.rejectBtn}
                                        onClick={() => handleReject(request.id)}
                                        disabled={processing === request.id}
                                    >
                                        ✗ Tolak
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Riwayat</h2>

                {processedRequests.length === 0 ? (
                    <div className={styles.empty}>Belum ada riwayat</div>
                ) : (
                    <div className={styles.requestList}>
                        {processedRequests.slice(0, 10).map((request) => (
                            <div key={request.id} className={styles.requestCard}>
                                <div className={styles.requestHeader}>
                                    <div>
                                        <span className={styles.requester}>{request.user.nama}</span>
                                        <span className={styles.date}>
                                            {new Date(request.createdAt).toLocaleDateString("id-ID")}
                                        </span>
                                    </div>
                                    <span
                                        className={`${styles.badge} ${request.status === "APPROVED"
                                                ? styles.approved
                                                : styles.rejected
                                            }`}
                                    >
                                        {request.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                                    </span>
                                </div>
                                <div className={styles.items}>
                                    {request.items.map((item) => (
                                        <div key={item.id} className={styles.item}>
                                            <span className={styles.itemName}>{item.barang.nama}</span>
                                            <span className={styles.itemQty}>
                                                {item.jumlahDiminta} {item.barang.satuan}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
