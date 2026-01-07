"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Input,
    Card,
    Table,
    Badge,
    IconButton,
    Dialog,
    Field,
    SimpleGrid,
    Group,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiSearch, FiPackage } from "react-icons/fi";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    stokMinimum: number;
    kategori?: { nama: string };
    stockBatches: { id: string; jumlah: number; sisaJumlah: number; tanggalMasuk: string }[];
}

export default function AdminStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isStokOpen, setIsStokOpen] = useState(false);

    // Form states
    const [nama, setNama] = useState("");
    const [satuan, setSatuan] = useState("");
    const [stokMinimum, setStokMinimum] = useState("10");
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [jumlahStok, setJumlahStok] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split("T")[0]);

    const showToast = (title: string, type: "success" | "error") => {
        toaster.create({ title, type });
    };

    const fetchBarang = async () => {
        try {
            const res = await fetch("/api/barang");
            const data = await res.json();
            setBarangList(data);
        } catch (error) {
            console.error("Error fetching barang:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBarang();
    }, []);

    const handleAddBarang = async () => {
        if (!nama || !satuan) return;
        try {
            await fetch("/api/barang", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nama, satuan, stokMinimum: parseInt(stokMinimum) }),
            });
            showToast("Barang berhasil ditambahkan", "success");
            setNama("");
            setSatuan("");
            setIsOpen(false);
            fetchBarang();
        } catch (error) {
            showToast("Gagal menambah barang", "error");
        }
    };

    const handleAddStok = async () => {
        if (!selectedBarang || !jumlahStok) return;
        try {
            await fetch("/api/stok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId: selectedBarang.id,
                    jumlah: parseInt(jumlahStok),
                    tanggalMasuk,
                }),
            });
            showToast("Stok berhasil ditambahkan", "success");
            setJumlahStok("");
            setIsStokOpen(false);
            fetchBarang();
        } catch (error) {
            showToast("Gagal menambah stok", "error");
        }
    };

    const handleDeleteBarang = async (id: string) => {
        if (!confirm("Yakin ingin menghapus barang ini?")) return;
        try {
            await fetch(`/api/barang/${id}`, { method: "DELETE" });
            showToast("Barang berhasil dihapus", "success");
            fetchBarang();
        } catch (error) {
            showToast("Gagal menghapus barang", "error");
        }
    };

    const filteredBarang = barangList.filter(
        (b) => b.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <HStack justify="space-between" mb={8}>
                <VStack align="start" gap={1}>
                    <Heading size="lg">Kelola Stok</Heading>
                    <Text color="gray.500">Manajemen barang dan stok inventori</Text>
                </VStack>
                <Button colorPalette="blue" onClick={() => setIsOpen(true)}>
                    <FiPlus />
                    Tambah Barang
                </Button>
            </HStack>

            <Card.Root mb={6}>
                <Card.Body>
                    <Group>
                        <FiSearch />
                        <Input
                            placeholder="Cari barang..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Group>
                </Card.Body>
            </Card.Root>

            <Card.Root>
                <Card.Body p={0}>
                    <Table.Root>
                        <Table.Header>
                            <Table.Row bg="gray.50">
                                <Table.ColumnHeader>Barang</Table.ColumnHeader>
                                <Table.ColumnHeader>Kategori</Table.ColumnHeader>
                                <Table.ColumnHeader>Satuan</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Stok</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Min</Table.ColumnHeader>
                                <Table.ColumnHeader>Status</Table.ColumnHeader>
                                <Table.ColumnHeader>Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {filteredBarang.map((barang) => (
                                <Table.Row key={barang.id}>
                                    <Table.Cell fontWeight="medium">{barang.nama}</Table.Cell>
                                    <Table.Cell>{barang.kategori?.nama || "-"}</Table.Cell>
                                    <Table.Cell>{barang.satuan}</Table.Cell>
                                    <Table.Cell textAlign="right" fontWeight="semibold">{barang.stokTotal}</Table.Cell>
                                    <Table.Cell textAlign="right" color="gray.500">{barang.stokMinimum}</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={
                                                barang.stokTotal <= 0
                                                    ? "red"
                                                    : barang.stokTotal <= barang.stokMinimum
                                                        ? "orange"
                                                        : "green"
                                            }
                                        >
                                            {barang.stokTotal <= 0
                                                ? "Habis"
                                                : barang.stokTotal <= barang.stokMinimum
                                                    ? "Menipis"
                                                    : "Tersedia"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <HStack>
                                            <Button
                                                size="sm"
                                                colorPalette="green"
                                                onClick={() => {
                                                    setSelectedBarang(barang);
                                                    setIsStokOpen(true);
                                                }}
                                            >
                                                + Stok
                                            </Button>
                                            <IconButton
                                                aria-label="Delete"
                                                size="sm"
                                                colorPalette="red"
                                                variant="ghost"
                                                onClick={() => handleDeleteBarang(barang.id)}
                                            >
                                                <FiTrash2 />
                                            </IconButton>
                                        </HStack>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Card.Body>
            </Card.Root>

            {/* Add Barang Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tambah Barang Baru</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label>Nama Barang</Field.Label>
                                    <Input value={nama} onChange={(e) => setNama(e.target.value)} />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label>Satuan</Field.Label>
                                    <Input value={satuan} onChange={(e) => setSatuan(e.target.value)} placeholder="pcs, rim, botol..." />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Stok Minimum</Field.Label>
                                    <Input type="number" value={stokMinimum} onChange={(e) => setStokMinimum(e.target.value)} />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleAddBarang}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Add Stok Dialog */}
            <Dialog.Root open={isStokOpen} onOpenChange={(e) => setIsStokOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tambah Stok - {selectedBarang?.nama}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label>Jumlah</Field.Label>
                                    <Input type="number" value={jumlahStok} onChange={(e) => setJumlahStok(e.target.value)} />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label>Tanggal Masuk</Field.Label>
                                    <Input type="date" value={tanggalMasuk} onChange={(e) => setTanggalMasuk(e.target.value)} />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" mr={3} onClick={() => setIsStokOpen(false)}>Batal</Button>
                            <Button colorPalette="green" onClick={handleAddStok}>Tambah Stok</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}
