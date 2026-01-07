"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    Button,
    Input,
    Field,
    HStack,
    Avatar,
    Badge,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiSave } from "react-icons/fi";

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
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Profil Saya</Heading>
                <Text color="gray.500">Kelola informasi akun Anda</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Header>
                    <HStack gap={4}>
                        <Avatar.Root size="lg" bg="blue.500">
                            <Avatar.Fallback>{(profile?.nama || "U").substring(0, 2).toUpperCase()}</Avatar.Fallback>
                        </Avatar.Root>
                        <VStack align="start" gap={1}>
                            <Text fontWeight="bold" fontSize="lg">{profile?.nama}</Text>
                            <Text color="gray.500" fontSize="sm">{profile?.email}</Text>
                            <HStack>
                                <Badge colorPalette="blue">{profile?.role}</Badge>
                                {profile?.unitKerja && (
                                    <Badge colorPalette="green">{profile.unitKerja.nama}</Badge>
                                )}
                            </HStack>
                        </VStack>
                    </HStack>
                </Card.Header>
                <Card.Body pt={0}>
                    <Text fontSize="sm" color="gray.500">
                        Bergabung sejak{" "}
                        {new Date(profile?.createdAt || "").toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </Text>
                </Card.Body>
            </Card.Root>

            <Card.Root mb={6}>
                <Card.Header>
                    <Text fontWeight="semibold">Ubah Nama</Text>
                </Card.Header>
                <Card.Body pt={0}>
                    <HStack>
                        <Field.Root>
                            <Input
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Nama lengkap"
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
                </Card.Body>
            </Card.Root>

            <Card.Root>
                <Card.Header>
                    <Text fontWeight="semibold">Ubah Password</Text>
                </Card.Header>
                <Card.Body pt={0}>
                    <VStack gap={4}>
                        <Field.Root>
                            <Field.Label fontSize="sm">Password Saat Ini</Field.Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </Field.Root>
                        <Field.Root>
                            <Field.Label fontSize="sm">Password Baru</Field.Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </Field.Root>
                        <Field.Root>
                            <Field.Label fontSize="sm">Konfirmasi Password Baru</Field.Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </Field.Root>
                        <Button
                            colorPalette="blue"
                            w="full"
                            onClick={handleUpdatePassword}
                            loading={saving}
                            disabled={!currentPassword || !newPassword || !confirmPassword}
                        >
                            Ubah Password
                        </Button>
                    </VStack>
                </Card.Body>
            </Card.Root>
        </Box>
    );
}
