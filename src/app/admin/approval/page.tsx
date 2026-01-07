"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    NativeSelect,
    Input,
    Field,
    NumberInput,
    IconButton,
    Dialog,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiArrowDown, FiCheck } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, StyledInput } from "@/components/ui/shared";

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
    const [isOpen, setIsOpen] = useState(false);

    const [levelNum, setLevelNum] = useState("1");
    const [nama, setNama] = useState("");
    const [roleRequired, setRoleRequired] = useState("");

    const showToast = (title: string, type: "success" | "info") => {
        toaster.create({ title, type });
    };

    const fetchLevels = async () => {
        const res = await fetch("/api/approval-level");
        setLevels(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchLevels(); }, []);

    const handleAdd = async () => {
        if (!nama || !roleRequired) return;
        await fetch("/api/approval-level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ level: parseInt(levelNum), nama, roleRequired }),
        });
        showToast("Level ditambahkan", "success");
        setLevelNum("1"); setNama(""); setRoleRequired("");
        setIsOpen(false);
        fetchLevels();
    };

    const handleDelete = async (id: string) => {
        await fetch(`/api/approval-level?id=${id}`, { method: "DELETE" });
        showToast("Level dihapus", "info");
        fetchLevels();
    };

    return (
        <Box>
            <HStack justify="space-between" mb={8} flexWrap="wrap" gap={4}>
                <PageHeader title="Konfigurasi Approval" subtitle="Atur level persetujuan permintaan" />
                <PrimaryButton onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Level
                </PrimaryButton>
            </HStack>

            <Card>
                <Text fontWeight="semibold" mb={4} style={{ color: "var(--foreground)" }}>Alur Persetujuan</Text>

                {levels.length === 0 ? (
                    <VStack py={10} gap={2}>
                        <Text style={{ color: "var(--muted-foreground)" }}>Belum ada konfigurasi approval.</Text>
                        <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>Jika kosong, approval langsung oleh Admin.</Text>
                    </VStack>
                ) : (
                    <VStack gap={0} align="center">
                        <Box
                            px={6}
                            py={2}
                            borderRadius="full"
                            fontWeight="medium"
                            style={{
                                background: "var(--stat-green-bg)",
                                color: "var(--stat-green-color)",
                            }}
                        >
                            📝 Request Dibuat
                        </Box>

                        {levels.sort((a, b) => a.level - b.level).map((level) => (
                            <VStack key={level.id} gap={0}>
                                <Box my={2} style={{ color: "var(--muted-foreground)" }}>
                                    <FiArrowDown size={24} />
                                </Box>
                                <Box
                                    borderRadius="xl"
                                    padding="1rem"
                                    style={{
                                        background: "var(--stat-blue-bg)",
                                        border: "2px solid var(--stat-blue-color)",
                                    }}
                                >
                                    <HStack justify="space-between" gap={4}>
                                        <VStack align="start" gap={0}>
                                            <HStack>
                                                <Text fontSize="xs" fontWeight="bold" style={{ color: "var(--stat-blue-color)" }}>
                                                    LEVEL {level.level}
                                                </Text>
                                                <Text fontWeight="semibold" style={{ color: "var(--foreground)" }}>{level.nama}</Text>
                                            </HStack>
                                            <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>
                                                Role: {ROLES.find((r) => r.value === level.roleRequired)?.label}
                                            </Text>
                                        </VStack>
                                        <IconButton
                                            aria-label="Delete"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(level.id)}
                                            style={{ color: "var(--stat-red-color)" }}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    </HStack>
                                </Box>
                            </VStack>
                        ))}

                        <Box my={2} style={{ color: "var(--muted-foreground)" }}>
                            <FiArrowDown size={24} />
                        </Box>
                        <Box
                            px={6}
                            py={2}
                            borderRadius="full"
                            fontWeight="medium"
                            style={{
                                background: "var(--stat-green-bg)",
                                color: "var(--stat-green-color)",
                            }}
                        >
                            <HStack><FiCheck /><Text>Disetujui & Stok Dikurangi</Text></HStack>
                        </Box>
                    </VStack>
                )}
            </Card>

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <Dialog.Header style={{ borderColor: "var(--card-border)" }}>
                            <Dialog.Title style={{ color: "var(--foreground)" }}>Tambah Level Approval</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Level</Field.Label>
                                    <NumberInput.Root value={levelNum} onValueChange={(e) => setLevelNum(e.value)} min={1}>
                                        <NumberInput.Input
                                            style={{
                                                background: "var(--input-bg)",
                                                borderColor: "var(--input-border)",
                                                color: "var(--foreground)",
                                            }}
                                        />
                                    </NumberInput.Root>
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Nama Level</Field.Label>
                                    <StyledInput value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Kepala Unit, Admin Gudang..." />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Role yang Bisa Approve</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            value={roleRequired}
                                            onChange={(e) => setRoleRequired(e.target.value)}
                                            style={{
                                                background: "var(--input-bg)",
                                                borderColor: "var(--input-border)",
                                                color: "var(--foreground)",
                                            }}
                                        >
                                            <option value="" style={{ background: "var(--card-bg)" }}>Pilih Role</option>
                                            {ROLES.map((r) => (
                                                <option key={r.value} value={r.value} style={{ background: "var(--card-bg)" }}>
                                                    {r.label}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer style={{ borderColor: "var(--card-border)" }}>
                            <Button
                                variant="ghost"
                                mr={3}
                                onClick={() => setIsOpen(false)}
                                style={{ color: "var(--foreground)" }}
                            >
                                Batal
                            </Button>
                            <PrimaryButton onClick={handleAdd}>Simpan</PrimaryButton>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}
