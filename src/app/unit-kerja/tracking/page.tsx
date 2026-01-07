"use client";

import { useState, useEffect } from "react";
import styles from "./tracking.module.css";

interface RequestItem {
    id: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: {
        nama: string;
        satuan: string;
    };
}

interface Request {
    id: string;
    status: string;
    catatan: string | null;
    createdAt: string;
    updatedAt: string;
    items: RequestItem[];
}

export default function UnitKerjaTrackingPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchRequests();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return { label: "Menunggu", class: styles.pending };
            case "APPROVED":
                return { label: "Disetujui", class: styles.approved };
            case "REJECTED":
                return { label: "Ditolak", class: styles.rejected };
            default:
                return { label: status, class: "" };
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Tracking Permintaan</h1>
            <p className={styles.subtitle}>Pantau status permintaan Anda</p>

            {requests.length === 0 ? (
                <div className={styles.empty}>
                    <p>Belum ada permintaan</p>
                </div>
            ) : (
                <div className={styles.timeline}>
                    {requests.map((request) => {
                        const statusBadge = getStatusBadge(request.status);
                        return (
                            <div key={request.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.dateInfo}>
                                        <span className={styles.date}>
                                            {new Date(request.createdAt).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span className={styles.time}>
                                            {new Date(request.createdAt).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <span className={`${styles.badge} ${statusBadge.class}`}>
                                        {statusBadge.label}
                                    </span>
                                </div>

                                <div className={styles.items}>
                                    {request.items.map((item) => (
                                        <div key={item.id} className={styles.item}>
                                            <span className={styles.itemName}>{item.barang.nama}</span>
                                            <div className={styles.itemQty}>
                                                <span>Diminta: {item.jumlahDiminta}</span>
                                                {request.status === "APPROVED" && (
                                                    <span className={styles.approvedQty}>
                                                        Disetujui: {item.jumlahDisetujui}
                                                    </span>
                                                )}
                                                <span className={styles.satuan}>
                                                    {item.barang.satuan}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {request.catatan && (
                                    <div className={styles.note}>📝 {request.catatan}</div>
                                )}

                                {request.status !== "PENDING" && (
                                    <div className={styles.footer}>
                                        Diproses:{" "}
                                        {new Date(request.updatedAt).toLocaleDateString("id-ID")}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
