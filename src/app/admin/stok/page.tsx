"use client";

import { useState, useEffect, Fragment } from "react";
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
    Heading,
    Text,
    NativeSelect,
    Card,
    SimpleGrid,
    Flex,
    Icon
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
    FiPlus,
    FiTrash2,
    FiPackage,
    FiChevronDown,
    FiChevronRight,
    FiSearch,
    FiFilter,
    FiBox
} from "react-icons/fi";

// --- TIPE DATA ---
interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    stokMinimum: number;
    kategori?: { nama: string };
    batches: {
        id: string;
        jumlah: number;
        sisaJumlah: number;
        tanggalMasuk: string;
        hargaSatuan?: number
    }[];
}

export default function AdminStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [kategoriList, setKategoriList] = useState<{ id: string; nama: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isStokOpen, setIsStokOpen] = useState(false);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Form states
    const [nama, setNama] = useState("");
    const [satuan, setSatuan] = useState("");
    const [stokMinimum, setStokMinimum] = useState("10");
    const [selectedBarang, setSelectedBarang] = useState<Barang | null>(null);
    const [jumlahStok, setJumlahStok] = useState("");
    const [hargaSatuan, setHargaSatuan] = useState("");
    const [tanggalMasuk, setTanggalMasuk] = useState(new Date().toISOString().split("T")[0]);
    const [kategoriId, setKategoriId] = useState("");

    const BPS_BLUE = "#005DA6";

    const showToast = (title: string, type: "success" | "error") => {
        toaster.create({ title, type });
    };

    const fetchBarang = async () => {
        try {
            const res = await fetch("/api/barang");
            const data = await res.json();
            setBarangList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching barang:", error);
            setBarangList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchKategori = async () => {
        try {
            const res = await fetch("/api/kategori");
            const data = await res.json();
            setKategoriList(data);
        } catch (error) {
            console.error("Error fetching kategori:", error);
        }
    };

    useEffect(() => {
        fetchBarang();
        fetchKategori();
    }, []);

    const handleAddBarang = async () => {
        if (!nama || !satuan) {
            showToast("Nama dan Satuan wajib diisi", "error");
            return;
        }
        try {
            await fetch("/api/barang", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nama,
                    satuan,
                    stokMinimum: parseInt(stokMinimum),
                    kategoriId: kategoriId || null,
                }),
            });
            showToast("Barang berhasil ditambahkan", "success");
            setNama(""); setSatuan(""); setIsOpen(false);
            fetchBarang();
        } catch (error) {
            showToast("Gagal menambah barang", "error");
        }
    };

    const handleAddStok = async () => {
        if (!selectedBarang || !jumlahStok) {
            showToast("Jumlah stok wajib diisi", "error");
            return;
        }
        try {
            await fetch("/api/stok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    barangId: selectedBarang.id,
                    jumlah: parseInt(jumlahStok),
                    hargaSatuan: hargaSatuan ? parseInt(hargaSatuan) : 0,
                    tanggalMasuk,
                }),
            });
            showToast("Stok berhasil ditambahkan", "success");
            setJumlahStok(""); setHargaSatuan(""); setIsStokOpen(false);
            fetchBarang();
        } catch (error) {
            showToast("Gagal menambah stok", "error");
        }
    };

    const handleDeleteBarang = async (id: string) => {
        if (!confirm("Yakin ingin menghapus barang ini beserta seluruh riwayat stoknya?")) return;
        try {
            await fetch(`/api/barang/${id}`, { method: "DELETE" });
            showToast("Barang berhasil dihapus", "success");
            fetchBarang();
        } catch (error) {
            showToast("Gagal menghapus barang", "error");
        }
    };

    const toggleExpanded = (id: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

    const filteredBarang = barangList.filter((b) =>
        b.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            {/* HEADER PAGE */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Box>
                    <Heading size="xl" color="gray.800" mb={1}>Manajemen Stok</Heading>
                    <Text color="gray.500">Daftar inventaris barang dan pencatatan stok masuk.</Text>
                </Box>
                <Button
                    bg={BPS_BLUE}
                    color="white"
                    _hover={{ bg: "#00457C" }}
                    onClick={() => setIsOpen(true)}
                    size="md"
                >
                    <FiPlus style={{ marginRight: "8px" }} /> Tambah Barang
                </Button>
            </Flex>

            {/* FILTER & SEARCH */}
            <Card.Root bg="white" shadow="sm" border="1px solid" borderColor="gray.200" mb={6}>
                <Card.Body p={4}>
                    <HStack gap={4}>
                        <Box flex={1}>
                            <HStack
                                bg="gray.50"
                                px={3} py={2}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                                _focusWithin={{ borderColor: BPS_BLUE, ring: "1px solid " + BPS_BLUE }}
                            >
                                <FiSearch color="gray" />
                                <Input
                                    placeholder="Cari nama barang..."
                                    border="none"
                                    _focus={{ outline: "none" }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    p={0}
                                />
                            </HStack>
                        </Box>
                        <Button variant="outline" color="gray.600" borderColor="gray.300">
                            <FiFilter style={{ marginRight: "6px" }} /> Filter
                        </Button>
                    </HStack>
                </Card.Body>
            </Card.Root>

            {/* TABLE DATA */}
            <Card.Root bg="white" shadow="sm" border="1px solid" borderColor="gray.200" overflow="hidden">
                <Box overflowX="auto">
                    <Table.Root size="md" interactive striped>
                        <Table.Header bg="gray.50">
                            <Table.Row>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold">Barang</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold">Kategori</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold">Satuan</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold" textAlign="right">Total Stok</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold" textAlign="right">Min. Stok</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold">Status</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.600" fontWeight="bold" textAlign="right">Aksi</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} textAlign="center" py={10} color="gray.500">Memuat data...</Table.Cell>
                                </Table.Row>
                            ) : filteredBarang.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} textAlign="center" py={10}>
                                        <VStack color="gray.400">
                                            <FiPackage size={40} />
                                            <Text>Data barang tidak ditemukan.</Text>
                                        </VStack>
                                    </Table.Cell>
                                </Table.Row>
                            ) : (
                                filteredBarang.map((barang) => {
                                    const isExpanded = expanded.has(barang.id);
                                    const statusColor = barang.stokTotal <= 0 ? "red" : barang.stokTotal <= barang.stokMinimum ? "orange" : "green";
                                    const statusLabel = barang.stokTotal <= 0 ? "Habis" : barang.stokTotal <= barang.stokMinimum ? "Menipis" : "Aman";

                                    return (
                                        <Fragment key={barang.id}>
                                            <Table.Row>
                                                <Table.Cell fontWeight="medium" color="gray.800">{barang.nama}</Table.Cell>
                                                <Table.Cell color="gray.600">{barang.kategori?.nama || "-"}</Table.Cell>
                                                <Table.Cell color="gray.600">{barang.satuan}</Table.Cell>
                                                <Table.Cell textAlign="right" fontWeight="bold" color="gray.800">{barang.stokTotal}</Table.Cell>
                                                <Table.Cell textAlign="right" color="gray.500">{barang.stokMinimum}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge colorPalette={statusColor} variant="subtle">{statusLabel}</Badge>
                                                </Table.Cell>
                                                <Table.Cell textAlign="right">
                                                    <HStack justify="end">
                                                        <IconButton
                                                            aria-label="Toggle" size="xs" variant="ghost"
                                                            onClick={() => toggleExpanded(barang.id)}
                                                            color="gray.500"
                                                        >
                                                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                                        </IconButton>
                                                        <Button
                                                            size="xs" variant="outline" color="blue.600" borderColor="blue.200"
                                                            onClick={() => { setSelectedBarang(barang); setIsStokOpen(true); }}
                                                        >
                                                            + Stok
                                                        </Button>
                                                        <IconButton
                                                            aria-label="Delete" size="xs" variant="ghost" colorPalette="red"
                                                            onClick={() => handleDeleteBarang(barang.id)}
                                                        >
                                                            <FiTrash2 />
                                                        </IconButton>
                                                    </HStack>
                                                </Table.Cell>
                                            </Table.Row>

                                            {/* DETAIL BATCH (EXPANDED ROW) */}
                                            {isExpanded && (
                                                <Table.Row bg="blue.50">
                                                    <Table.Cell colSpan={7} p={4}>
                                                        <Card.Root size="sm" variant="outline" bg="white">
                                                            <Card.Body>
                                                                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">Riwayat Stok Masuk (FIFO)</Text>
                                                                {barang.batches && barang.batches.length > 0 ? (
                                                                    <Table.Root size="sm" variant="line">
                                                                        <Table.Header>
                                                                            <Table.Row>
                                                                                <Table.ColumnHeader>Tgl Masuk</Table.ColumnHeader>
                                                                                <Table.ColumnHeader textAlign="right">Awal</Table.ColumnHeader>
                                                                                <Table.ColumnHeader textAlign="right">Sisa</Table.ColumnHeader>
                                                                                <Table.ColumnHeader textAlign="right">Harga/Unit</Table.ColumnHeader>
                                                                            </Table.Row>
                                                                        </Table.Header>
                                                                        <Table.Body>
                                                                            {barang.batches.map(batch => (
                                                                                <Table.Row key={batch.id}>
                                                                                    <Table.Cell>{formatDate(batch.tanggalMasuk)}</Table.Cell>
                                                                                    <Table.Cell textAlign="right">{batch.jumlah}</Table.Cell>
                                                                                    <Table.Cell textAlign="right" fontWeight="bold" color="blue.600">{batch.sisaJumlah}</Table.Cell>
                                                                                    <Table.Cell textAlign="right">{batch.hargaSatuan ? `Rp ${batch.hargaSatuan.toLocaleString()}` : '-'}</Table.Cell>
                                                                                </Table.Row>
                                                                            ))}
                                                                        </Table.Body>
                                                                    </Table.Root>
                                                                ) : (
                                                                    <Text fontSize="sm" color="gray.400">Belum ada data batch stok.</Text>
                                                                )}
                                                            </Card.Body>
                                                        </Card.Root>
                                                    </Table.Cell>
                                                </Table.Row>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Card.Root>

            {/* --- DIALOG TAMBAH BARANG --- */}
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
                                    <Input
                                        placeholder="Contoh: Kertas A4"
                                        value={nama} onChange={(e) => setNama(e.target.value)}
                                    />
                                </Field.Root>

                                <SimpleGrid columns={2} gap={4} w="full">
                                    <Field.Root required>
                                        <Field.Label>Satuan</Field.Label>
                                        <Input
                                            placeholder="Rim, Pcs..."
                                            value={satuan} onChange={(e) => setSatuan(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>Stok Minimum</Field.Label>
                                        <Input
                                            type="number"
                                            value={stokMinimum} onChange={(e) => setStokMinimum(e.target.value)}
                                        />
                                    </Field.Root>
                                </SimpleGrid>

                                <Field.Root>
                                    <Field.Label>Kategori</Field.Label>
                                    <NativeSelect.Root>
                                        <NativeSelect.Field
                                            placeholder="Pilih kategori..."
                                            value={kategoriId}
                                            onChange={(e) => setKategoriId(e.target.value)}
                                        >
                                            {kategoriList.map((k) => (
                                                <option key={k.id} value={k.id}>{k.nama}</option>
                                            ))}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button bg={BPS_BLUE} color="white" onClick={handleAddBarang}>Simpan</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* --- DIALOG TAMBAH STOK --- */}
            <Dialog.Root open={isStokOpen} onOpenChange={(e) => setIsStokOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Tambah Stok: {selectedBarang?.nama}</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap={4}>
                                <Field.Root required>
                                    <Field.Label>Jumlah Masuk</Field.Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={jumlahStok} onChange={(e) => setJumlahStok(e.target.value)}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Harga Satuan (Opsional)</Field.Label>
                                    <Input
                                        type="number"
                                        placeholder="Rp 0"
                                        value={hargaSatuan} onChange={(e) => setHargaSatuan(e.target.value)}
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Tanggal Masuk</Field.Label>
                                    <Input
                                        type="date"
                                        value={tanggalMasuk} onChange={(e) => setTanggalMasuk(e.target.value)}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" onClick={() => setIsStokOpen(false)}>Batal</Button>
                            <Button colorPalette="green" onClick={handleAddStok}>Tambah Stok</Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

        </Box>
    );
}