"use client";

import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Button,
    Input,
    Table,
    Badge,
    IconButton,
    Dialog,
    Field,
    NumberInput,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, StyledInput } from "@/components/ui/shared";

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
            <HStack justify="space-between" mb={8} flexWrap="wrap" gap={4}>
                <PageHeader title="Unit Kerja" subtitle="Kelola departemen dan quota" />
                <PrimaryButton onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Unit
                </PrimaryButton>
            </HStack>

            <Card>
                <Box overflowX="auto">
                    <Table.Root>
                        <Table.Header>
                            <Table.Row style={{ background: "var(--table-header-bg)" }}>
                                <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Nama Unit</Table.ColumnHeader>
                                <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Kode</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right" style={{ color: "var(--foreground)" }}>Quota/Bulan</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right" style={{ color: "var(--foreground)" }}>Anggota</Table.ColumnHeader>
                                <Table.ColumnHeader w="100px" style={{ color: "var(--foreground)" }}>Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {unitList.map((unit) => (
                                <Table.Row key={unit.id} style={{ borderColor: "var(--card-border)" }}>
                                    <Table.Cell fontWeight="medium" style={{ color: "var(--foreground)" }}>{unit.nama}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            style={{
                                                background: "var(--stat-blue-bg)",
                                                color: "var(--stat-blue-color)",
                                            }}
                                        >
                                            {unit.kode}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell textAlign="right" style={{ color: "var(--foreground)" }}>{unit.quotaBulanan}</Table.Cell>
                                    <Table.Cell textAlign="right" style={{ color: "var(--foreground)" }}>{unit._count?.users || 0}</Table.Cell>
                                    <Table.Cell>
                                        <IconButton
                                            aria-label="Delete"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(unit.id)}
                                            style={{ color: "var(--stat-red-color)" }}
                                        >
                                            <FiTrash2 />
                                        </IconButton>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Card>

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <Dialog.Header style={{ borderColor: "var(--card-border)" }}>
                            <Dialog.Title style={{ color: "var(--foreground)" }}>Tambah Unit Kerja</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Nama</Field.Label>
                                    <StyledInput value={nama} onChange={(e) => setNama(e.target.value)} placeholder="IT Department" />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Kode</Field.Label>
                                    <StyledInput value={kode} onChange={(e) => setKode(e.target.value)} placeholder="IT" />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label style={{ color: "var(--foreground)" }}>Quota Bulanan</Field.Label>
                                    <NumberInput.Root value={quota} onValueChange={(e) => setQuota(e.value)} min={1}>
                                        <NumberInput.Input
                                            style={{
                                                background: "var(--input-bg)",
                                                borderColor: "var(--input-border)",
                                                color: "var(--foreground)",
                                            }}
                                        />
                                    </NumberInput.Root>
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
