"use client";

import { useState, useEffect } from "react";
import styles from "./approval.module.css";

interface ApprovalLevel {
    id: string;
    level: number;
    nama: string;
    roleRequired: string;
}

const ROLES = [
    { value: "KEPALA_UNIT", label: "Kepala Unit" },
    { value: "ADMIN", label: "Admin Gudang" },
];

export default function AdminApprovalPage() {
    const [levels, setLevels] = useState<ApprovalLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [levelNum, setLevelNum] = useState("");
    const [nama, setNama] = useState("");
    const [roleRequired, setRoleRequired] = useState("");

    const fetchLevels = async () => {
        try {
            const res = await fetch("/api/approval-level");
            const data = await res.json();
            setLevels(data);
        } catch (error) {
            console.error("Error fetching levels:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/approval-level", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    level: parseInt(levelNum),
                    nama,
                    roleRequired,
                }),
            });

            if (res.ok) {
                setLevelNum("");
                setNama("");
                setRoleRequired("");
                setShowForm(false);
                fetchLevels();
            }
        } catch (error) {
            console.error("Error creating level:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus level ini?")) return;
        try {
            await fetch(`/api/approval-level?id=${id}`, { method: "DELETE" });
            fetchLevels();
        } catch (error) {
            console.error("Error deleting level:", error);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Konfigurasi Approval</h1>
                    <p className={styles.subtitle}>Atur level persetujuan permintaan barang</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Batal" : "+ Tambah Level"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Level</label>
                            <input
                                type="number"
                                min="1"
                                value={levelNum}
                                onChange={(e) => setLevelNum(e.target.value)}
                                className={styles.input}
                                placeholder="1, 2, 3..."
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nama Level</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className={styles.input}
                                placeholder="Kepala Unit, Admin Gudang..."
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role yang Bisa Approve</label>
                            <select
                                value={roleRequired}
                                onChange={(e) => setRoleRequired(e.target.value)}
                                className={styles.select}
                                required
                            >
                                <option value="">Pilih Role</option>
                                {ROLES.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Simpan
                    </button>
                </form>
            )}

            <div className={styles.flowSection}>
                <h3>Alur Persetujuan Saat Ini</h3>
                {levels.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Belum ada konfigurasi approval.</p>
                        <p className={styles.hint}>
                            Tambah level approval untuk mengaktifkan multi-level approval.
                            Jika kosong, approval langsung oleh Admin.
                        </p>
                    </div>
                ) : (
                    <div className={styles.flow}>
                        <div className={styles.flowStart}>📝 Request Dibuat</div>
                        {levels.map((level, index) => (
                            <div key={level.id} className={styles.flowItem}>
                                <div className={styles.flowArrow}>↓</div>
                                <div className={styles.flowCard}>
                                    <div className={styles.flowLevel}>Level {level.level}</div>
                                    <div className={styles.flowName}>{level.nama}</div>
                                    <div className={styles.flowRole}>
                                        Role: {ROLES.find((r) => r.value === level.roleRequired)?.label || level.roleRequired}
                                    </div>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDelete(level.id)}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className={styles.flowArrow}>↓</div>
                        <div className={styles.flowEnd}>✅ Disetujui & Stok Dikurangi</div>
                    </div>
                )}
            </div>
        </div>
    );
}
