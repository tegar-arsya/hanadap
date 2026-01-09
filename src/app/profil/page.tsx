"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toaster } from "@/components/ui/toaster";
import { FiSave, FiLock } from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

interface Profile {
    id: string;
    email: string;
    nama: string;
    role: string;
    unitKerja: { nama: string; kode: string } | null;
    createdAt: string;
}

export default function ProfilPage() {
    const { update } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdateNama = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama }),
            });

            if (res.ok) {
                toaster.create({ title: "Nama berhasil diubah", type: "success" });
                await update({ name: nama });
                fetchProfile();
            } else {
                const data = await res.json();
                toaster.create({ title: data.error || "Gagal mengubah nama", type: "error" });
            }
        } catch (error) {
            toaster.create({ title: "Terjadi kesalahan", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toaster.create({ title: "Password baru tidak cocok", type: "warning" });
            return;
        }
        if (newPassword.length < 6) {
            toaster.create({ title: "Password minimal 6 karakter", type: "warning" });
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
                toaster.create({ title: "Password berhasil diubah", type: "success" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                toaster.create({ title: data.error || "Gagal mengubah password", type: "error" });
            }
        } catch (error) {
            toaster.create({ title: "Terjadi kesalahan", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[#005DA6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            <PageHeader
                title="Profil Saya"
                description="Kelola informasi akun Anda"
            />

            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold">
                        {(profile?.nama || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{profile?.nama}</p>
                        <p className="text-gray-500 text-sm">{profile?.email}</p>
                        <div className="flex gap-2 mt-1">
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                {profile?.role}
                            </span>
                            {profile?.unitKerja && (
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                                    {profile.unitKerja.nama}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-500">
                    Bergabung sejak{" "}
                    {new Date(profile?.createdAt || "").toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </Card>

            <div className="mt-4">
                <Card title="Ubah Nama">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            placeholder="Nama lengkap"
                            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                        />
                        <button
                            onClick={handleUpdateNama}
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <FiSave className="w-4 h-4" />
                            )}
                            Simpan
                        </button>
                    </div>
                </Card>
            </div>

            <div className="mt-4">
                <Card title="Ubah Password">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Saat Ini</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password Baru</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005DA6] focus:border-transparent text-sm"
                            />
                        </div>
                        <button
                            onClick={handleUpdatePassword}
                            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#005DA6] text-white rounded-lg hover:bg-[#00457C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <FiLock className="w-4 h-4" />
                            )}
                            Ubah Password
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
