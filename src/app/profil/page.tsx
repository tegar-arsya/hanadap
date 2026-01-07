"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    VStack,
    Button,
    Input,
    Field,
    HStack,
    Avatar,
    Badge,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiSave, FiUser, FiLock } from "react-icons/fi";
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
    const { data: session, update } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nama, setNama] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const showToast = (title: string, type: "success" | "error" | "warning") => {
        toaster.create({
            title,
            type,
        });
    };

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
                showToast("Nama berhasil diubah", "success");
                await update({ name: nama });
                fetchProfile();
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal mengubah nama", "error");
            }
        } catch (error) {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast("Password baru tidak cocok", "warning");
            return;
        }
        if (newPassword.length < 6) {
            showToast("Password minimal 6 karakter", "warning");
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
                showToast("Password berhasil diubah", "success");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const data = await res.json();
                showToast(data.error || "Gagal mengubah password", "error");
            }
        } catch (error) {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    return (
        <Box maxW="600px" mx="auto">
            <PageHeader
                title="Profil Saya"
                description="Kelola informasi akun Anda"
            />

            <Card>
                <HStack gap={4} mb={4}>
                    <Avatar.Root size="lg" colorPalette="blue">
                        <Avatar.Fallback>{(profile?.nama || "U").substring(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap={1}>
                        <Text fontWeight="bold" fontSize="lg" color="var(--foreground)">{profile?.nama}</Text>
                        <Text color="var(--sidebar-text-muted)" fontSize="sm">{profile?.email}</Text>
                        <HStack>
                            <Badge colorPalette="blue">{profile?.role}</Badge>
                            {profile?.unitKerja && (
                                <Badge colorPalette="green">{profile.unitKerja.nama}</Badge>
                            )}
                        </HStack>
                    </VStack>
                </HStack>
                <Text fontSize="sm" color="var(--sidebar-text-muted)">
                    Bergabung sejak{" "}
                    {new Date(profile?.createdAt || "").toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </Text>
            </Card>

            <Box mt={4}>
                <Card title="Ubah Nama">
                    <HStack flexWrap={{ base: "wrap", md: "nowrap" }} gap={3}>
                        <Field.Root flex={1}>
                            <Input
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Nama lengkap"
                                bg="var(--input-bg)"
                                borderColor="var(--input-border)"
                                color="var(--foreground)"
                            />
                        </Field.Root>
                        <Button
                            colorPalette="blue"
                            onClick={handleUpdateNama}
                            loading={saving}
                        >
                            <FiSave />
                            Simpan
                        </Button>
                    </HStack>
                </Card>
            </Box>

            <Box mt={4}>
                <Card title="Ubah Password">
                    <VStack gap={4}>
                        <Field.Root w="full">
                            <Field.Label fontSize="sm" color="var(--foreground)">Password Saat Ini</Field.Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                bg="var(--input-bg)"
                                borderColor="var(--input-border)"
                                color="var(--foreground)"
                            />
                        </Field.Root>
                        <Field.Root w="full">
                            <Field.Label fontSize="sm" color="var(--foreground)">Password Baru</Field.Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                bg="var(--input-bg)"
                                borderColor="var(--input-border)"
                                color="var(--foreground)"
                            />
                        </Field.Root>
                        <Field.Root w="full">
                            <Field.Label fontSize="sm" color="var(--foreground)">Konfirmasi Password Baru</Field.Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                bg="var(--input-bg)"
                                borderColor="var(--input-border)"
                                color="var(--foreground)"
                            />
                        </Field.Root>
                        <Button
                            colorPalette="blue"
                            w="full"
                            onClick={handleUpdatePassword}
                            loading={saving}
                            disabled={!currentPassword || !newPassword || !confirmPassword}
                        >
                            <FiLock />
                            Ubah Password
                        </Button>
                    </VStack>
                </Card>
            </Box>
        </Box>
    );
}
