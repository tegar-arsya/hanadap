"use client";

import { useState, useEffect } from "react";
import styles from "./stok.module.css";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    batches: {
        id: string;
        jumlah: number;
        sisaJumlah: number;
        tanggalMasuk: string;
    }[];
}

export default function AdminStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showStockForm, setShowStockForm] = useState<string | null>(null);

    // Form states
    const [namaBarang, setNamaBarang] = useState("");
    const [satuan, setSatuan] = useState("");
    const [jumlahStok, setJumlahStok] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState("");

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

    useEffect(() => {
        fetchBarang();
    }, []);

    const handleAddBarang = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/barang", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama: namaBarang, satuan }),
            });

            if (res.ok) {
                setNamaBarang("");
                setSatuan("");
                setShowAddForm(false);
                fetchBarang();
            }
        } catch (error) {
            console.error("Error adding barang:", error);
        }
    };

    const handleAddStock = async (barangId: string) => {
        try {
            const res = await fetch("/api/stok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId,
                    jumlah: parseInt(jumlahStok),
                    tanggalMasuk: tanggalMasuk || undefined,
                }),
            });

            if (res.ok) {
                setJumlahStok("");
                setTanggalMasuk("");
                setShowStockForm(null);
                fetchBarang();
            }
        } catch (error) {
            console.error("Error adding stock:", error);
        }
    };

    const handleDeleteBarang = async (id: string) => {
        if (!confirm("Yakin ingin menghapus barang ini?")) return;

        try {
            const res = await fetch(`/api/barang/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchBarang();
            }
        } catch (error) {
            console.error("Error deleting barang:", error);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Kelola Stok</h1>
                    <p className={styles.subtitle}>Tambah barang dan kelola stok inventori</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? "Batal" : "+ Tambah Barang"}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddBarang} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Nama Barang"
                        value={namaBarang}
                        onChange={(e) => setNamaBarang(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Satuan (pcs, kg, dll)"
                        value={satuan}
                        onChange={(e) => setSatuan(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.submitButton}>
                        Simpan
                    </button>
                </form>
            )}

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>Nama Barang</span>
                    <span>Satuan</span>
                    <span>Stok Total</span>
                    <span>Batch FIFO</span>
                    <span>Aksi</span>
                </div>

                {barangList.length === 0 ? (
                    <div className={styles.empty}>Belum ada barang</div>
                ) : (
                    barangList.map((barang) => (
                        <div key={barang.id} className={styles.tableRow}>
                            <span className={styles.nama}>{barang.nama}</span>
                            <span>{barang.satuan}</span>
                            <span className={styles.stok}>{barang.stokTotal}</span>
                            <span className={styles.batches}>
                                {barang.batches.length > 0 ? (
                                    barang.batches.slice(0, 3).map((batch, i) => (
                                        <span key={batch.id} className={styles.batch}>
                                            {i === 0 && "🏷️ "}
                                            {batch.sisaJumlah} (
                                            {new Date(batch.tanggalMasuk).toLocaleDateString("id-ID")})
                                        </span>
                                    ))
                                ) : (
                                    <span className={styles.noBatch}>-</span>
                                )}
                            </span>
                            <span className={styles.actions}>
                                <button
                                    className={styles.actionBtn}
                                    onClick={() =>
                                        setShowStockForm(showStockForm === barang.id ? null : barang.id)
                                    }
                                >
                                    + Stok
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteBarang(barang.id)}
                                >
                                    Hapus
                                </button>
                            </span>

                            {showStockForm === barang.id && (
                                <div className={styles.stockForm}>
                                    <input
                                        type="number"
                                        placeholder="Jumlah"
                                        value={jumlahStok}
                                        onChange={(e) => setJumlahStok(e.target.value)}
                                        className={styles.input}
                                        min="1"
                                        required
                                    />
                                    <input
                                        type="date"
                                        value={tanggalMasuk}
                                        onChange={(e) => setTanggalMasuk(e.target.value)}
                                        className={styles.input}
                                    />
                                    <button
                                        className={styles.submitButton}
                                        onClick={() => handleAddStock(barang.id)}
                                    >
                                        Tambah Stok
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
