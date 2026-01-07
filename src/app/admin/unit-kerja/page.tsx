"use client";

import { useState, useEffect } from "react";
import styles from "./unit-kerja.module.css";

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
    quotaBulanan: number;
    _count: { users: number };
}

export default function AdminUnitKerjaPage() {
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [nama, setNama] = useState("");
    const [kode, setKode] = useState("");
    const [quota, setQuota] = useState("100");
    const [editId, setEditId] = useState<string | null>(null);

    const fetchUnitKerja = async () => {
        try {
            const res = await fetch("/api/unit-kerja");
            const data = await res.json();
            setUnitKerjaList(data);
        } catch (error) {
            console.error("Error fetching unit kerja:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnitKerja();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                nama,
                kode,
                quotaBulanan: parseInt(quota),
            };

            if (editId) {
                await fetch(`/api/unit-kerja/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                await fetch("/api/unit-kerja", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            resetForm();
            fetchUnitKerja();
        } catch (error) {
            console.error("Error saving unit kerja:", error);
        }
    };

    const resetForm = () => {
        setNama("");
        setKode("");
        setQuota("100");
        setEditId(null);
        setShowForm(false);
    };

    const handleEdit = (unit: UnitKerja) => {
        setNama(unit.nama);
        setKode(unit.kode);
        setQuota(unit.quotaBulanan.toString());
        setEditId(unit.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus unit kerja ini?")) return;
        try {
            await fetch(`/api/unit-kerja/${id}`, { method: "DELETE" });
            fetchUnitKerja();
        } catch (error) {
            console.error("Error deleting unit kerja:", error);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Unit Kerja</h1>
                    <p className={styles.subtitle}>Kelola departemen dan quota request bulanan</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) resetForm();
                    }}
                >
                    {showForm ? "Batal" : "+ Tambah Unit"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="text"
                        placeholder="Nama Unit (IT Department)"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Kode (IT)"
                        value={kode}
                        onChange={(e) => setKode(e.target.value.toUpperCase())}
                        className={styles.inputSmall}
                        maxLength={10}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Quota"
                        value={quota}
                        onChange={(e) => setQuota(e.target.value)}
                        className={styles.inputSmall}
                        min="1"
                        required
                    />
                    <button type="submit" className={styles.submitButton}>
                        {editId ? "Update" : "Simpan"}
                    </button>
                </form>
            )}

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>Unit Kerja</span>
                    <span>Kode</span>
                    <span>Quota/Bulan</span>
                    <span>Anggota</span>
                    <span>Aksi</span>
                </div>

                {unitKerjaList.length === 0 ? (
                    <div className={styles.empty}>Belum ada unit kerja</div>
                ) : (
                    unitKerjaList.map((unit) => (
                        <div key={unit.id} className={styles.tableRow}>
                            <span className={styles.nama}>{unit.nama}</span>
                            <span className={styles.kode}>{unit.kode}</span>
                            <span>{unit.quotaBulanan} item</span>
                            <span>{unit._count.users} user</span>
                            <span className={styles.actions}>
                                <button className={styles.editBtn} onClick={() => handleEdit(unit)}>
                                    Edit
                                </button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(unit.id)}>
                                    Hapus
                                </button>
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
