"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./profil.module.css";

interface Profile {
    id: string;
    email: string;
    nama: string;
    role: string;
    unitKerja: { nama: string; kode: string } | null;
    createdAt: string;
}

export default function ProfilPage() {
    const { data: session, update } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Form states
    const [nama, setNama] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            setProfile(data);
            setNama(data.nama);
        } catch (err) {
            console.error("Error fetching profile:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateNama = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama }),
            });

            if (res.ok) {
                setMessage("Nama berhasil diubah");
                await update({ name: nama }); // Update session
                fetchProfile();
            } else {
                const data = await res.json();
                setError(data.error || "Gagal mengubah nama");
            }
        } catch (err) {
            setError("Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Password baru tidak cocok");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password minimal 6 karakter");
            return;
        }

        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                setMessage("Password berhasil diubah");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                setError(data.error || "Gagal mengubah password");
            }
        } catch (err) {
            setError("Terjadi kesalahan");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Profil Saya</h1>
            <p className={styles.subtitle}>Kelola informasi akun Anda</p>

            {message && <div className={styles.success}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.card}>
                <h3>Informasi Akun</h3>
                <div className={styles.info}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email</span>
                        <span className={styles.value}>{profile?.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Role</span>
                        <span className={styles.value}>{profile?.role}</span>
                    </div>
                    {profile?.unitKerja && (
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Unit Kerja</span>
                            <span className={styles.value}>
                                {profile.unitKerja.nama} ({profile.unitKerja.kode})
                            </span>
                        </div>
                    )}
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Bergabung</span>
                        <span className={styles.value}>
                            {new Date(profile?.createdAt || "").toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3>Ubah Nama</h3>
                <form onSubmit={handleUpdateNama} className={styles.form}>
                    <input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className={styles.input}
                        placeholder="Nama lengkap"
                        required
                    />
                    <button type="submit" className={styles.btn} disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan Nama"}
                    </button>
                </form>
            </div>

            <div className={styles.card}>
                <h3>Ubah Password</h3>
                <form onSubmit={handleUpdatePassword} className={styles.form}>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.input}
                        placeholder="Password saat ini"
                        required
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.input}
                        placeholder="Password baru"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        placeholder="Konfirmasi password baru"
                        required
                    />
                    <button type="submit" className={styles.btn} disabled={saving}>
                        {saving ? "Menyimpan..." : "Ubah Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
