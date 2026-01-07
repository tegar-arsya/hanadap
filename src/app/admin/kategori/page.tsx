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
    IconButton,
    Dialog,
    Field,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Kategori {
    id: string;
    nama: string;
    _count?: { barang: number };
}

export default function AdminKategoriPage() {
    const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [nama, setNama] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const showToast = (title: string, type: "success" | "info") => {
        toaster.create({ title, type });
    };

    const fetchKategori = async () => {
        const res = await fetch("/api/kategori");
        setKategoriList(await res.json());
        setLoading(false);
    };

    useEffect(() => { fetchKategori(); }, []);

    const handleAdd = async () => {
        if (!nama) return;
        await fetch("/api/kategori", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nama }),
        });
        showToast("Kategori ditambahkan", "success");
        setNama("");
        setIsOpen(false);
        fetchKategori();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Yakin ingin menghapus kategori?")) return;
        await fetch(`/api/kategori/${id}`, { method: "DELETE" });
        showToast("Kategori dihapus", "info");
        fetchKategori();
    };

    return (
        <Box>
            <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                    <Heading size="lg">Kategori</Heading>
                    <Text color="gray.500">Kelola kategori barang</Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Kategori
                </Button>
            </HStack>

            <Card.Root>
                <Card.Body p={0}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader>Nama Kategori</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Jumlah Barang</Table.ColumnHeader>
                                <Table.ColumnHeader w="100px">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {kategoriList.map((kat) => (
                                <Table.Row key={kat.id}>
                                    <Table.Cell fontWeight="medium">{kat.nama}</Table.Cell>
                                    <Table.Cell textAlign="right">{kat._count?.barang || 0}</Table.Cell>
                                    <Table.Cell>
                                        <IconButton
                                            aria-label="Delete"
                                            size="sm"
                                            colorPalette="red"
                                            variant="ghost"
                                            onClick={() => handleDelete(kat.id)}
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
                            <Dialog.Title>Tambah Kategori</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <Field.Root>
                                <Field.Label>Nama Kategori</Field.Label>
                                <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="ATK, Elektronik, dll" />
                            </Field.Root>
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
