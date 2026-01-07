"use client";

import { useState, useEffect } from "react";
import {
    VStack,
    Button,
    Input,
    Table,
    IconButton,
    Dialog,
    Field,
    Box,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, TableLoadingRow, TableEmptyRow } from "@/components/ui/shared";

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
        <>
            <PageHeader
                title="Kategori"
                description="Kelola kategori barang"
            >
                <PrimaryButton icon={FiPlus} onClick={() => setIsOpen(true)}>
                    Tambah Kategori
                </PrimaryButton>
            </PageHeader>

            <Card>
                <Box overflowX="auto" mx={-5} mb={-5}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row bg="var(--table-header-bg)">
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama Kategori</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="right">Jumlah Barang</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider" w="100px">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <TableLoadingRow colSpan={3} />
                            ) : kategoriList.length === 0 ? (
                                <TableEmptyRow
                                    colSpan={3}
                                    message="Tidak ada kategori"
                                    description="Tambahkan kategori baru"
                                />
                            ) : (
                                kategoriList.map((kat) => (
                                    <Table.Row key={kat.id} _hover={{ bg: "var(--table-row-hover)" }}>
                                        <Table.Cell px={5} py={3} fontWeight="medium" color="var(--foreground)">{kat.nama}</Table.Cell>
                                        <Table.Cell px={5} py={3} textAlign="right" color="var(--foreground)">{kat._count?.barang || 0}</Table.Cell>
                                        <Table.Cell px={5} py={3}>
                                            <IconButton
                                                aria-label="Delete"
                                                size="xs"
                                                colorPalette="red"
                                                variant="ghost"
                                                onClick={() => handleDelete(kat.id)}
                                            >
                                                <FiTrash2 />
                                            </IconButton>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Card>

            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="var(--card-bg)" borderColor="var(--card-border)">
                        <Dialog.Header borderBottom="1px solid" borderColor="var(--card-border)">
                            <Dialog.Title color="var(--foreground)">Tambah Kategori</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <Field.Root>
                                <Field.Label color="var(--foreground)">Nama Kategori</Field.Label>
                                <Input
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    placeholder="ATK, Elektronik, dll"
                                    bg="var(--input-bg)"
                                    borderColor="var(--input-border)"
                                    color="var(--foreground)"
                                />
                            </Field.Root>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="var(--card-border)">
                            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleAdd}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
