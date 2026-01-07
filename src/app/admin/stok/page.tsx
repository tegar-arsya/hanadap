"use client";

import { useState, useEffect } from "react";
import {
    VStack,
    HStack,
    Button,
    Input,
    Table,
    Badge,
    IconButton,
    Dialog,
    Field,
    Box,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiPackage } from "react-icons/fi";
import {
    PageHeader,
    Card,
    SearchInput,
    PrimaryButton,
    StatusBadge,
    TableLoadingRow,
    TableEmptyRow,
} from "@/components/ui/shared";

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

    const getStatusInfo = (barang: Barang) => {
        if (barang.stokTotal <= 0) return { label: "Habis", color: "red" as const };
        if (barang.stokTotal <= barang.stokMinimum) return { label: "Menipis", color: "orange" as const };
        return { label: "Tersedia", color: "green" as const };
    };

    return (
        <>
            <PageHeader
                title="Kelola Stok"
                description="Manajemen barang dan stok inventori"
            >
                <PrimaryButton icon={FiPlus} onClick={() => setIsOpen(true)}>
                    Tambah Barang
                </PrimaryButton>
            </PageHeader>

            <Card>
                <Box mb={4}>
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Cari barang..."
                    />
                </Box>

                <Box overflowX="auto" mx={-5} mb={-5}>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row bg="var(--table-header-bg)">
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Barang</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Kategori</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Satuan</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="right">Stok</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="right">Min</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Status</Table.ColumnHeader>
                                <Table.ColumnHeader px={5} py={3} color="var(--sidebar-text-muted)" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <TableLoadingRow colSpan={7} />
                            ) : filteredBarang.length === 0 ? (
                                <TableEmptyRow
                                    colSpan={7}
                                    icon={<FiPackage size={48} />}
                                    message="Tidak ada barang ditemukan"
                                    description="Coba ubah kata kunci pencarian"
                                />
                            ) : (
                                filteredBarang.map((barang) => {
                                    const status = getStatusInfo(barang);
                                    return (
                                        <Table.Row key={barang.id} _hover={{ bg: "var(--table-row-hover)" }}>
                                            <Table.Cell px={5} py={3} fontWeight="medium" color="var(--foreground)">{barang.nama}</Table.Cell>
                                            <Table.Cell px={5} py={3} color="var(--sidebar-text-muted)">{barang.kategori?.nama || "-"}</Table.Cell>
                                            <Table.Cell px={5} py={3} color="var(--foreground)">{barang.satuan}</Table.Cell>
                                            <Table.Cell px={5} py={3} textAlign="right" fontWeight="semibold" color="var(--foreground)">{barang.stokTotal}</Table.Cell>
                                            <Table.Cell px={5} py={3} textAlign="right" color="var(--sidebar-text-muted)">{barang.stokMinimum}</Table.Cell>
                                            <Table.Cell px={5} py={3}>
                                                <StatusBadge status={status.label} colorScheme={status.color} />
                                            </Table.Cell>
                                            <Table.Cell px={5} py={3}>
                                                <HStack>
                                                    <Button
                                                        size="xs"
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
                                                        size="xs"
                                                        colorPalette="red"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteBarang(barang.id)}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </HStack>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Card>

            {/* Add Barang Dialog */}
            <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="var(--card-bg)" borderColor="var(--card-border)">
                        <Dialog.Header borderBottom="1px solid" borderColor="var(--card-border)">
                            <Dialog.Title color="var(--foreground)">Tambah Barang Baru</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label color="var(--foreground)">Nama Barang</Field.Label>
                                    <Input
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        bg="var(--input-bg)"
                                        borderColor="var(--input-border)"
                                        color="var(--foreground)"
                                    />
                                </Field.Root>
                                <Field.Root required>
                                    <Field.Label color="var(--foreground)">Satuan</Field.Label>
                                    <Input
                                        value={satuan}
                                        onChange={(e) => setSatuan(e.target.value)}
                                        placeholder="pcs, rim, botol..."
                                        bg="var(--input-bg)"
                                        borderColor="var(--input-border)"
                                        color="var(--foreground)"
                                    />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label color="var(--foreground)">Stok Minimum</Field.Label>
                                    <Input
                                        type="number"
                                        value={stokMinimum}
                                        onChange={(e) => setStokMinimum(e.target.value)}
                                        bg="var(--input-bg)"
                                        borderColor="var(--input-border)"
                                        color="var(--foreground)"
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="var(--card-border)">
                            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button colorPalette="blue" onClick={handleAddBarang}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* Add Stok Dialog */}
            <Dialog.Root open={isStokOpen} onOpenChange={(e) => setIsStokOpen(e.open)}>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="var(--card-bg)" borderColor="var(--card-border)">
                        <Dialog.Header borderBottom="1px solid" borderColor="var(--card-border)">
                            <Dialog.Title color="var(--foreground)">Tambah Stok - {selectedBarang?.nama}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={5}>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label color="var(--foreground)">Jumlah</Field.Label>
                                    <Input
                                        type="number"
                                        value={jumlahStok}
                                        onChange={(e) => setJumlahStok(e.target.value)}
                                        bg="var(--input-bg)"
                                        borderColor="var(--input-border)"
                                        color="var(--foreground)"
                                    />
                                </Field.Root>
                                <Field.Root>
                                    <Field.Label color="var(--foreground)">Tanggal Masuk</Field.Label>
                                    <Input
                                        type="date"
                                        value={tanggalMasuk}
                                        onChange={(e) => setTanggalMasuk(e.target.value)}
                                        bg="var(--input-bg)"
                                        borderColor="var(--input-border)"
                                        color="var(--foreground)"
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="var(--card-border)">
                            <Button variant="ghost" mr={3} onClick={() => setIsStokOpen(false)}>Batal</Button>
                            <Button colorPalette="green" onClick={handleAddStok}>Tambah Stok</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
