"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    NativeSelect,
    NumberInput,
    Field,
    Textarea,
    Table,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCornerDownLeft, FiSend } from "react-icons/fi";
import { PageHeader, Card, EmptyStateBox, PrimaryButton, StyledInput } from "@/components/ui/shared";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
}

interface ReturnHistory {
    id: string;
    createdAt: string;
    jumlah: number;
    keterangan: string;
    barang: { nama: string; satuan: string };
}

export default function UnitKerjaReturnPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [history, setHistory] = useState<ReturnHistory[]>([]);
    const [selectedBarang, setSelectedBarang] = useState("");
    const [jumlah, setJumlah] = useState("1");
    const [keterangan, setKeterangan] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/barang").then((res) => res.json()).then(setBarangList);
        fetch("/api/return").then((res) => res.json()).then(setHistory);
    }, []);

    const handleSubmit = async () => {
        if (!selectedBarang) return;
        setLoading(true);
        const res = await fetch("/api/return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barangId: selectedBarang, jumlah: parseInt(jumlah), keterangan }),
        });

        if (res.ok) {
            toaster.create({ title: "Pengembalian berhasil dicatat", type: "success" });
            setSelectedBarang("");
            setJumlah("1");
            setKeterangan("");
            const updatedHistory = await fetch("/api/return").then((r) => r.json());
            setHistory(updatedHistory);
        } else {
            toaster.create({ title: "Gagal mencatat pengembalian", type: "error" });
        }
        setLoading(false);
    };

    return (
        <Box>
            <PageHeader title="Pengembalian Barang" subtitle="Kembalikan barang yang tidak terpakai" />

            <Card style={{ marginBottom: "1.5rem" }}>
                <HStack mb={4}>
                    <Box style={{ color: "var(--stat-purple-color)" }}>
                        <FiCornerDownLeft />
                    </Box>
                    <Text fontWeight="semibold" style={{ color: "var(--foreground)" }}>
                        Form Pengembalian
                    </Text>
                </HStack>

                <VStack gap={4}>
                    <Field.Root required width="100%">
                        <Field.Label style={{ color: "var(--foreground)" }}>Barang</Field.Label>
                        <NativeSelect.Root width="100%">
                            <NativeSelect.Field
                                value={selectedBarang}
                                onChange={(e) => setSelectedBarang(e.target.value)}
                                style={{
                                    background: "var(--input-bg)",
                                    borderColor: "var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            >
                                <option value="" style={{ background: "var(--card-bg)" }}>Pilih barang</option>
                                {barangList.map((b) => (
                                    <option key={b.id} value={b.id} style={{ background: "var(--card-bg)" }}>
                                        {b.nama} ({b.satuan})
                                    </option>
                                ))}
                            </NativeSelect.Field>
                        </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root required width="100%">
                        <Field.Label style={{ color: "var(--foreground)" }}>Jumlah</Field.Label>
                        <NumberInput.Root value={jumlah} onValueChange={(e) => setJumlah(e.value)} min={1} width="100%">
                            <NumberInput.Input
                                style={{
                                    background: "var(--input-bg)",
                                    borderColor: "var(--input-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                            <NumberInput.Control>
                                <NumberInput.IncrementTrigger style={{ color: "var(--foreground)" }} />
                                <NumberInput.DecrementTrigger style={{ color: "var(--foreground)" }} />
                            </NumberInput.Control>
                        </NumberInput.Root>
                    </Field.Root>

                    <Field.Root width="100%">
                        <Field.Label style={{ color: "var(--foreground)" }}>Keterangan</Field.Label>
                        <Textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Alasan pengembalian (opsional)"
                            style={{
                                background: "var(--input-bg)",
                                borderColor: "var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        />
                    </Field.Root>

                    <Button
                        w="full"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!selectedBarang}
                        style={{
                            background: "var(--stat-green-color)",
                            color: "white",
                            fontWeight: 600,
                        }}
                    >
                        <FiSend />
                        Kembalikan Barang
                    </Button>
                </VStack>
            </Card>

            <Card>
                <Text fontWeight="semibold" mb={4} style={{ color: "var(--foreground)" }}>
                    Riwayat Pengembalian
                </Text>

                {history.length === 0 ? (
                    <Text textAlign="center" py={6} style={{ color: "var(--muted-foreground)" }}>
                        Belum ada pengembalian
                    </Text>
                ) : (
                    <Box overflowX="auto">
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row style={{ background: "var(--table-header-bg)" }}>
                                    <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Tanggal</Table.ColumnHeader>
                                    <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Barang</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="right" style={{ color: "var(--foreground)" }}>Jumlah</Table.ColumnHeader>
                                    <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Keterangan</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {history.map((item) => (
                                    <Table.Row key={item.id} style={{ borderColor: "var(--card-border)" }}>
                                        <Table.Cell style={{ color: "var(--foreground)" }}>
                                            {new Date(item.createdAt).toLocaleDateString("id-ID")}
                                        </Table.Cell>
                                        <Table.Cell style={{ color: "var(--foreground)" }}>{item.barang.nama}</Table.Cell>
                                        <Table.Cell textAlign="right" style={{ color: "var(--foreground)" }}>
                                            {item.jumlah} {item.barang.satuan}
                                        </Table.Cell>
                                        <Table.Cell style={{ color: "var(--muted-foreground)" }}>
                                            {item.keterangan || "-"}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                )}
            </Card>
        </Box>
    );
}
