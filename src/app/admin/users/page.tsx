"use client";

import { useState, useEffect } from "react";
import styles from "./users.module.css";

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
}

interface User {
    id: string;
    email: string;
    nama: string;
    role: string;
    isActive: boolean;
    unitKerjaId: string | null;
    unitKerja: { nama: string; kode: string } | null;
    createdAt: string;
}

const ROLES = [
    { value: "ADMIN", label: "Admin" },
    { value: "KEPALA_UNIT", label: "Kepala Unit" },
    { value: "UNIT_KERJA", label: "Unit Kerja" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPasswordReset, setShowPasswordReset] = useState<string | null>(null);

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nama, setNama] = useState("");
    const [role, setRole] = useState("UNIT_KERJA");
    const [unitKerjaId, setUnitKerjaId] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const fetchData = async () => {
        try {
            const [usersRes, unitRes] = await Promise.all([
                fetch("/api/users"),
                fetch("/api/unit-kerja"),
            ]);
            const usersData = await usersRes.json();
            const unitData = await unitRes.json();
            setUsers(usersData);
            setUnitKerjaList(unitData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setEmail("");
        setPassword("");
        setNama("");
        setRole("UNIT_KERJA");
        setUnitKerjaId("");
        setEditingUser(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update user
                await fetch("/api/users", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: editingUser.id,
                        nama,
                        role,
                        unitKerjaId: unitKerjaId || null,
                    }),
                });
            } else {
                // Create new user
                await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                        nama,
                        role,
                        unitKerjaId: unitKerjaId || null,
                    }),
                });
            }
            resetForm();
            fetchData();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEmail(user.email);
        setNama(user.nama);
        setRole(user.role);
        setUnitKerjaId(user.unitKerjaId || "");
        setShowForm(true);
    };

    const handleToggleActive = async (user: User) => {
        const action = user.isActive ? "nonaktifkan" : "aktifkan";
        if (!confirm(`Yakin ingin ${action} user "${user.nama}"?`)) return;

        try {
            await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: user.id,
                    isActive: !user.isActive,
                }),
            });
            fetchData();
        } catch (error) {
            console.error("Error toggling user:", error);
        }
    };

    const handleResetPassword = async (userId: string) => {
        if (!newPassword) return;

        try {
            await fetch("/api/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: userId,
                    newPassword,
                }),
            });
            setNewPassword("");
            setShowPasswordReset(null);
            alert("Password berhasil direset");
        } catch (error) {
            console.error("Error resetting password:", error);
        }
    };

    if (loading) return <div className={styles.loading}>Memuat...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Manajemen User</h1>
                    <p className={styles.subtitle}>Kelola akun pengguna sistem</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                >
                    {showForm ? "Batal" : "+ Tambah User"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>{editingUser ? "Edit User" : "Tambah User Baru"}</h3>
                    <div className={styles.formGrid}>
                        {!editingUser && (
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        )}
                        {!editingUser && (
                            <div className={styles.formGroup}>
                                <label>Password Awal</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className={styles.input}
                                placeholder="Nama lengkap"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className={styles.select}
                                required
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Unit Kerja</label>
                            <select
                                value={unitKerjaId}
                                onChange={(e) => setUnitKerjaId(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">Tidak ada (Admin)</option>
                                {unitKerjaList.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama} ({unit.kode})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        {editingUser ? "Update User" : "Simpan User"}
                    </button>
                </form>
            )}

            <div className={styles.table}>
                <div className={styles.tableHeader}>
                    <span>User</span>
                    <span>Role</span>
                    <span>Unit Kerja</span>
                    <span>Status</span>
                    <span>Aksi</span>
                </div>

                {users.length === 0 ? (
                    <div className={styles.empty}>Belum ada user</div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className={`${styles.tableRow} ${!user.isActive ? styles.inactive : ""}`}
                        >
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{user.nama}</span>
                                <span className={styles.userEmail}>{user.email}</span>
                            </div>
                            <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                                {ROLES.find((r) => r.value === user.role)?.label || user.role}
                            </span>
                            <span>{user.unitKerja?.nama || "-"}</span>
                            <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactiveBadge}`}>
                                {user.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                            <div className={styles.actions}>
                                <button className={styles.editBtn} onClick={() => handleEdit(user)}>
                                    Edit
                                </button>
                                <button
                                    className={styles.resetBtn}
                                    onClick={() => setShowPasswordReset(showPasswordReset === user.id ? null : user.id)}
                                >
                                    Reset Password
                                </button>
                                <button
                                    className={user.isActive ? styles.deactivateBtn : styles.activateBtn}
                                    onClick={() => handleToggleActive(user)}
                                >
                                    {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                                </button>
                            </div>

                            {showPasswordReset === user.id && (
                                <div className={styles.passwordReset}>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="Password baru"
                                    />
                                    <button
                                        className={styles.submitBtn}
                                        onClick={() => handleResetPassword(user.id)}
                                    >
                                        Reset
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
