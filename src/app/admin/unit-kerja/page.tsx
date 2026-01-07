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
    Input,
    Table,
    Badge,
    IconButton,
    Dialog,
    Field,
    NumberInput,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
    quotaBulanan: number;
    _count?: { users: number };
}

export default function AdminUnitKerjaPage() {
    const [unitList, setUnitList] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const [nama, setNama] = useState("");
    const [kode, setKode] = useState("");
    const [quota, setQuota] = useState("100");

    const showToast = (title: string, type: "success" | "info") => {
        toaster.create({ title, type });
    };

    const fetchData = async () => {
        const res = await fetch("/api/unit-kerja");
        setUnitList(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = async () => {
        if (!nama || !kode) return;
        await fetch("/api/unit-kerja", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama, kode, quotaBulanan: parseInt(quota) }),
        });
        showToast("Unit Kerja ditambahkan", "success");
        setNama(""); setKode(""); setQuota("100");
        setIsOpen(false);
        fetchData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus?")) return;
        await fetch(`/api/unit-kerja/${id}`, { method: "DELETE" });
        showToast("Unit Kerja dihapus", "info");
        fetchData();
    };

    return (
        <Box>
            <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                    <Heading size="lg">Unit Kerja</Heading>
                    <Text color="gray.500">Kelola departemen dan quota</Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Unit
                </Button>
            </HStack>

            <Card.Root>
                <Card.Body p={0}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader>Nama Unit</Table.ColumnHeader>
                                <Table.ColumnHeader>Kode</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Quota/Bulan</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Anggota</Table.ColumnHeader>
                                <Table.ColumnHeader w="100px">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {unitList.map((unit) => (
                                <Table.Row key={unit.id}>
                                    <Table.Cell fontWeight="medium">{unit.nama}</Table.Cell>
                                    <Table.Cell><Badge colorPalette="blue">{unit.kode}</Badge></Table.Cell>
                                    <Table.Cell textAlign="right">{unit.quotaBulanan}</Table.Cell>
                                    <Table.Cell textAlign="right">{unit._count?.users || 0}</Table.Cell>
                                    <Table.Cell>
                                        <IconButton
                                            aria-label="Delete"
                                            size="sm"
                                            colorPalette="red"
                                            variant="ghost"
                                            onClick={() => handleDelete(unit.id)}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Card.Body>
            </Card.Root>

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tambah Unit Kerja</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label>Nama</Field.Label>
                                    <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="IT Department" />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Kode</Field.Label>
                                    <Input value={kode} onChange={(e) => setKode(e.target.value)} placeholder="IT" />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Quota Bulanan</Field.Label>
                                    <NumberInput.Root value={quota} onValueChange={(e) => setQuota(e.value)} min={1}>
                                        <NumberInput.Input />
                                    </NumberInput.Root>
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
