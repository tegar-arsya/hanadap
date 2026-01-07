"use client";

import { useState, useEffect } from "react";
import styles from "./kategori.module.css";

interface Kategori {
    id: string;
    nama: string;
    _count: { barang: number };
}

export default function AdminKategoriPage() {
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [namaKategori, setNamaKategori] = useState("");
    const [editId, setEditId] = useState<string | null>(null);

    const fetchKategori = async () => {
        try {
            const res = await fetch("/api/kategori");
            const data = await res.json();
            setKategoriList(data);
        } catch (error) {
            console.error("Error fetching kategori:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKategori();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await fetch(`/api/kategori/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nama: namaKategori }),
                });
            } else {
                await fetch("/api/kategori", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nama: namaKategori }),
                });
            }
            setNamaKategori("");
            setEditId(null);
            setShowForm(false);
            fetchKategori();
        } catch (error) {
            console.error("Error saving kategori:", error);
        }
    };

    const handleEdit = (kategori: Kategori) => {
        setNamaKategori(kategori.nama);
        setEditId(kategori.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        try {
            await fetch(`/api/kategori/${id}`, { method: "DELETE" });
            fetchKategori();
        } catch (error) {
            console.error("Error deleting kategori:", error);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Kategori Barang</h1>
                    <p className={styles.subtitle}>Kelola kategori untuk pengelompokan barang</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditId(null);
                        setNamaKategori("");
                    }}
                >
                    {showForm ? "Batal" : "+ Tambah Kategori"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Nama Kategori (ATK, Elektronik, dll)"
                        value={namaKategori}
                        onChange={(e) => setNamaKategori(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <button type="submit" className={styles.submitButton}>
                        {editId ? "Update" : "Simpan"}
                    </button>
                </form>
            )}

            <div className={styles.grid}>
                {kategoriList.length === 0 ? (
                    <div className={styles.empty}>Belum ada kategori</div>
                ) : (
                    kategoriList.map((kategori) => (
                        <div key={kategori.id} className={styles.card}>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{kategori.nama}</h3>
                                <span className={styles.count}>{kategori._count.barang} barang</span>
                            </div>
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => handleEdit(kategori)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(kategori.id)}
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
