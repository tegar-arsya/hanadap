"use client";

import { useState, useEffect } from "react";
import styles from "./stok.module.css";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
}

export default function UnitKerjaStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchBarang = async () => {
            try {
                const res = await fetch("/api/barang");
                const data = await res.json();
                setBarangList(data);
            } catch (error) {
                console.error("Error fetching barang:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBarang();
    }, []);

    const filteredBarang = barangList.filter((barang) =>
        barang.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Lihat Stok</h1>
                    <p className={styles.subtitle}>Daftar barang yang tersedia</p>
                </div>
            </div>

            <div className={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Cari barang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.grid}>
                {filteredBarang.length === 0 ? (
                    <div className={styles.empty}>Tidak ada barang ditemukan</div>
                ) : (
                    filteredBarang.map((barang) => (
                        <div key={barang.id} className={styles.card}>
                            <div className={styles.cardIcon}>📦</div>
                            <h3 className={styles.cardTitle}>{barang.nama}</h3>
                            <div className={styles.cardInfo}>
                                <span className={styles.stok}>{barang.stokTotal}</span>
                                <span className={styles.satuan}>{barang.satuan}</span>
                            </div>
                            <div
                                className={`${styles.status} ${barang.stokTotal > 10
                                        ? styles.statusOk
                                        : barang.stokTotal > 0
                                            ? styles.statusLow
                                            : styles.statusEmpty
                                    }`}
                            >
                                {barang.stokTotal > 10
                                    ? "Tersedia"
                                    : barang.stokTotal > 0
                                        ? "Stok Menipis"
                                        : "Habis"}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
