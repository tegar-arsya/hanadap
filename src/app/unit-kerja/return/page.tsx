"use client";

import { useState, useEffect } from "react";
import styles from "./return.module.css";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
}

interface ReturnLog {
    id: string;
    jumlah: number;
    keterangan: string | null;
    createdAt: string;
    barang: { nama: string };
}

export default function UnitKerjaReturnPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [returns, setReturns] = useState<ReturnLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedBarang, setSelectedBarang] = useState("");
    const [jumlah, setJumlah] = useState("");
    const [keterangan, setKeterangan] = useState("");

    const fetchData = async () => {
        try {
            const [barangRes, returnsRes] = await Promise.all([
                fetch("/api/barang"),
                fetch("/api/return"),
            ]);
            const barangData = await barangRes.json();
            const returnsData = await returnsRes.json();
            setBarangList(barangData);
            setReturns(returnsData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBarang || !jumlah) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/return", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId: selectedBarang,
                    jumlah: parseInt(jumlah),
                    keterangan,
                }),
            });

            if (res.ok) {
                setSelectedBarang("");
                setJumlah("");
                setKeterangan("");
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || "Gagal memproses pengembalian");
            }
        } catch (error) {
            console.error("Error submitting return:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Pengembalian Barang</h1>
            <p className={styles.subtitle}>Kembalikan barang yang tidak terpakai</p>

            <div className={styles.formCard}>
                <h3>Form Pengembalian</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Pilih Barang</label>
                        <select
                            value={selectedBarang}
                            onChange={(e) => setSelectedBarang(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="">-- Pilih Barang --</option>
                            {barangList.map((barang) => (
                                <option key={barang.id} value={barang.id}>
                                    {barang.nama} ({barang.satuan})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Jumlah</label>
                        <input
                            type="number"
                            min="1"
                            value={jumlah}
                            onChange={(e) => setJumlah(e.target.value)}
                            className={styles.input}
                            placeholder="Masukkan jumlah"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Keterangan (opsional)</label>
                        <textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className={styles.textarea}
                            placeholder="Alasan pengembalian..."
                            rows={2}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? "Memproses..." : "Kembalikan Barang"}
                    </button>
                </form>
            </div>

            <div className={styles.historySection}>
                <h3>Riwayat Pengembalian</h3>
                {returns.length === 0 ? (
                    <div className={styles.empty}>Belum ada riwayat pengembalian</div>
                ) : (
                    <div className={styles.historyList}>
                        {returns.map((item) => (
                            <div key={item.id} className={styles.historyItem}>
                                <div className={styles.historyInfo}>
                                    <span className={styles.historyName}>{item.barang.nama}</span>
                                    <span className={styles.historyDate}>
                                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <span className={styles.historyQty}>+{item.jumlah}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
