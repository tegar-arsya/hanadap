"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
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
            <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                    <Heading size="lg">Konfigurasi Approval</Heading>
                    <Text color="gray.500">Atur level persetujuan permintaan</Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Level
                </Button>
            </HStack>

            <Card.Root>
                <Card.Body>
                    <Text fontWeight="semibold" mb={4}>Alur Persetujuan</Text>

                    {levels.length === 0 ? (
                        <VStack py={10} gap={2}>
                            <Text color="gray.500">Belum ada konfigurasi approval.</Text>
                            <Text fontSize="sm" color="gray.400">Jika kosong, approval langsung oleh Admin.</Text>
                        </VStack>
                    ) : (
                        <VStack gap={0} align="center">
                            <Box bg="green.100" color="green.700" px={6} py={2} borderRadius="full" fontWeight="medium">
                                📝 Request Dibuat
                            </Box>

                            {levels.sort((a, b) => a.level - b.level).map((level) => (
                                <VStack key={level.id} gap={0}>
                                    <Box my={2} color="gray.300">
                                        <FiArrowDown size={24} />
                                    </Box>
                                    <Card.Root borderWidth={2} borderColor="blue.200" bg="blue.50">
                                        <Card.Body py={3} px={4}>
                                            <HStack justify="space-between">
                                                <VStack align="start" gap={0}>
                                                    <HStack>
                                                        <Text fontSize="xs" color="blue.500" fontWeight="bold">LEVEL {level.level}</Text>
                                                        <Text fontWeight="semibold">{level.nama}</Text>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.500">
                                                        Role: {ROLES.find((r) => r.value === level.roleRequired)?.label}
                                                    </Text>
                                                </VStack>
                                                <IconButton
                                                    aria-label="Delete"
                                                    size="sm"
                                                    colorPalette="red"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(level.id)}
                                                >
                                                    <FiTrash2 />
                                                </IconButton>
                                            </HStack>
                                        </Card.Body>
                                    </Card.Root>
                                </VStack>
                            ))}

                            <Box my={2} color="gray.300">
                                <FiArrowDown size={24} />
                            </Box>
                            <Box bg="green.100" color="green.700" px={6} py={2} borderRadius="full" fontWeight="medium">
                                <HStack><FiCheck /><Text>Disetujui & Stok Dikurangi</Text></HStack>
                            </Box>
                        </VStack>
                    )}
                </Card.Body>
            </Card.Root>

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tambah Level Approval</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label>Level</Field.Label>
                                    <NumberInput.Root value={levelNum} onValueChange={(e) => setLevelNum(e.value)} min={1}>
                                        <NumberInput.Input />
                                    </NumberInput.Root>
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Nama Level</Field.Label>
                                    <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Kepala Unit, Admin Gudang..." />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Role yang Bisa Approve</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field value={roleRequired} onChange={(e) => setRoleRequired(e.target.value)}>
                                            <option value="">Pilih Role</option>
                                            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleAdd}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}
