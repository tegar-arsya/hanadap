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
            setNama(""); setSatuan(""); setStokMinimum("10"); setKategoriId(""); setIsOpen(false);
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
        <Box p={6} bg="gray.50" minH="100vh">
            {/* HEADER PAGE */}
            <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                <Box>
                    <Heading size="2xl" color="gray.800" mb={2}>Manajemen Stok</Heading>
                    <Text color="gray.600" fontSize="md">Daftar inventaris barang dan pencatatan stok masuk.</Text>
                </Box>
                <Button
                    bg={BPS_BLUE}
                    color="white"
                    _hover={{ bg: "#00457C", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    px={6}
                    shadow="sm"
                    transition="all 0.2s"
                >
                    <FiPlus style={{ marginRight: "8px" }} /> Tambah Barang
                </Button>
            </Flex>

            {/* FILTER & SEARCH */}
            <Card.Root bg="white" shadow="md" mb={6} borderRadius="lg">
                <Card.Body p={5}>
                    <HStack gap={4}>
                        <Box flex={1}>
                            <HStack
                                bg="gray.50"
                                px={4} 
                                py={3}
                                borderRadius="lg"
                                border="2px solid"
                                borderColor="gray.200"
                                _focusWithin={{ 
                                    borderColor: BPS_BLUE, 
                                    bg: "white",
                                    shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)"
                                }}
                                transition="all 0.2s"
                            >
                                <FiSearch color="#718096" size={20} />
                                <Input
                                    placeholder="Cari nama barang..."
                                    border="none"
                                    _focus={{ outline: "none" }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    p={0}
                                    fontSize="md"
                                />
                            </HStack>
                        </Box>
                        <Button 
                            variant="outline" 
                            color="gray.700" 
                            borderColor="gray.300"
                            _hover={{ bg: "gray.50", borderColor: "gray.400" }}
                            px={6}
                            size="lg"
                        >
                            <FiFilter style={{ marginRight: "6px" }} /> Filter
                        </Button>
                    </HStack>
                </Card.Body>
            </Card.Root>

            {/* TABLE DATA */}
            <Card.Root bg="white" shadow="md" borderRadius="lg" overflow="hidden">
                <Box overflowX="auto">
                    <Table.Root size="lg" variant="line">
                        <Table.Header>
                            <Table.Row bg="gray.50" borderBottom="2px solid" borderColor="gray.200">
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm" py={4}>BARANG</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm">KATEGORI</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm">SATUAN</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm" textAlign="right">TOTAL STOK</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm" textAlign="right">MIN. STOK</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm">STATUS</Table.ColumnHeader>
                                <Table.ColumnHeader color="gray.700" fontWeight="semibold" fontSize="sm" textAlign="right">AKSI</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} textAlign="center" py={12} color="gray.500">Memuat data...</Table.Cell>
                                </Table.Row>
                            ) : filteredBarang.length === 0 ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7} textAlign="center" py={12}>
                                        <VStack color="gray.400" gap={3}>
                                            <FiPackage size={48} />
                                            <Text fontSize="lg">Data barang tidak ditemukan.</Text>
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
                                            <Table.Row 
                                                _hover={{ bg: "gray.50" }}
                                                transition="background 0.15s"
                                            >
                                                <Table.Cell fontWeight="semibold" color="gray.900" fontSize="md" py={4}>{barang.nama}</Table.Cell>
                                                <Table.Cell color="gray.600" fontSize="md">{barang.kategori?.nama || "-"}</Table.Cell>
                                                <Table.Cell color="gray.600" fontSize="md">{barang.satuan}</Table.Cell>
                                                <Table.Cell textAlign="right" fontWeight="bold" color="gray.900" fontSize="md">{barang.stokTotal}</Table.Cell>
                                                <Table.Cell textAlign="right" color="gray.600" fontSize="md">{barang.stokMinimum}</Table.Cell>
                                                <Table.Cell>
                                                    <Badge 
                                                        colorPalette={statusColor} 
                                                        variant="subtle"
                                                        px={3}
                                                        py={1}
                                                        borderRadius="full"
                                                        fontSize="xs"
                                                        fontWeight="semibold"
                                                    >
                                                        {statusLabel}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell textAlign="right">
                                                    <HStack justify="end" gap={2}>
                                                        <IconButton
                                                            aria-label="Toggle" 
                                                            size="sm" 
                                                            variant="ghost"
                                                            onClick={() => toggleExpanded(barang.id)}
                                                            color="gray.600"
                                                            _hover={{ bg: "gray.100" }}
                                                        >
                                                            {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                                                        </IconButton>
                                                        <Button
                                                            size="sm" 
                                                            bg={BPS_BLUE}
                                                            color="white"
                                                            _hover={{ bg: "#00457C" }}
                                                            onClick={() => { setSelectedBarang(barang); setIsStokOpen(true); }}
                                                            px={4}
                                                        >
                                                            + Stok
                                                        </Button>
                                                        <IconButton
                                                            aria-label="Delete" 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            colorPalette="red"
                                                            onClick={() => handleDeleteBarang(barang.id)}
                                                            _hover={{ bg: "red.50" }}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </IconButton>
                                                    </HStack>
                                                </Table.Cell>
                                            </Table.Row>

                                            {/* DETAIL BATCH (EXPANDED ROW) */}
                                            {isExpanded && (
                                                <Table.Row bg="blue.50">
                                                    <Table.Cell colSpan={7} p={5}>
                                                        <Card.Root size="sm" bg="white" shadow="sm" borderRadius="md">
                                                            <Card.Body p={4}>
                                                                <Text fontSize="xs" fontWeight="bold" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="wide">
                                                                    Riwayat Stok Masuk (FIFO)
                                                                </Text>
                                                                {barang.batches && barang.batches.length > 0 ? (
                                                                    <Table.Root size="sm">
                                                                        <Table.Header>
                                                                            <Table.Row bg="gray.50">
                                                                                <Table.ColumnHeader fontSize="xs" color="gray.600">Tgl Masuk</Table.ColumnHeader>
                                                                                <Table.ColumnHeader fontSize="xs" color="gray.600" textAlign="right">Awal</Table.ColumnHeader>
                                                                                <Table.ColumnHeader fontSize="xs" color="gray.600" textAlign="right">Sisa</Table.ColumnHeader>
                                                                                <Table.ColumnHeader fontSize="xs" color="gray.600" textAlign="right">Harga/Unit</Table.ColumnHeader>
                                                                            </Table.Row>
                                                                        </Table.Header>
                                                                        <Table.Body>
                                                                            {barang.batches.map(batch => (
                                                                                <Table.Row key={batch.id}>
                                                                                    <Table.Cell fontSize="sm" color="gray.700">{formatDate(batch.tanggalMasuk)}</Table.Cell>
                                                                                    <Table.Cell fontSize="sm" color="gray.600" textAlign="right">{batch.jumlah}</Table.Cell>
                                                                                    <Table.Cell fontSize="sm" textAlign="right" fontWeight="semibold" color={BPS_BLUE}>{batch.sisaJumlah}</Table.Cell>
                                                                                    <Table.Cell fontSize="sm" color="gray.600" textAlign="right">{batch.hargaSatuan ? `Rp ${batch.hargaSatuan.toLocaleString()}` : '-'}</Table.Cell>
                                                                                </Table.Row>
                                                                            ))}
                                                                        </Table.Body>
                                                                    </Table.Root>
                                                                ) : (
                                                                    <Text fontSize="sm" color="gray.500">Belum ada data batch stok.</Text>
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
                    <Dialog.Content maxW="500px" borderRadius="xl" shadow="xl">
                        <Dialog.Header borderBottom="1px solid" borderColor="gray.200" pb={4}>
                            <Dialog.Title fontSize="xl" fontWeight="bold" color="gray.800">Tambah Barang Baru</Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={6}>
                            <VStack gap={5}>
                                <Field.Root required w="full">
                                    <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Nama Barang</Field.Label>
                                    <Input
                                        placeholder="Contoh: Kertas A4"
                                        value={nama} 
                                        onChange={(e) => setNama(e.target.value)}
                                        size="lg"
                                        borderRadius="lg"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                    />
                                </Field.Root>

                                <SimpleGrid columns={2} gap={4} w="full">
                                    <Field.Root required>
                                        <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Satuan</Field.Label>
                                        <Input
                                            placeholder="Rim, Pcs..."
                                            value={satuan} 
                                            onChange={(e) => setSatuan(e.target.value)}
                                            size="lg"
                                            borderRadius="lg"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Stok Minimum</Field.Label>
                                        <Input
                                            type="number"
                                            value={stokMinimum} 
                                            onChange={(e) => setStokMinimum(e.target.value)}
                                            size="lg"
                                            borderRadius="lg"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                        />
                                    </Field.Root>
                                </SimpleGrid>

                                <Field.Root w="full">
                                    <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Kategori</Field.Label>
                                    <NativeSelect.Root size="lg">
                                        <NativeSelect.Field
                                            placeholder="Pilih kategori..."
                                            value={kategoriId}
                                            onChange={(e) => setKategoriId(e.target.value)}
                                            borderRadius="lg"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                        >
                                            {kategoriList.map((k) => (
                                                <option key={k.id} value={k.id}>{k.nama}</option>
                                            ))}
                                        </NativeSelect.Field>
                                    </NativeSelect.Root>
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="gray.200" pt={4} gap={3}>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsOpen(false)}
                                size="lg"
                                px={6}
                                borderColor="gray.300"
                                _hover={{ bg: "gray.50" }}
                            >
                                Batal
                            </Button>
                            <Button 
                                bg={BPS_BLUE} 
                                color="white" 
                                onClick={handleAddBarang}
                                size="lg"
                                px={6}
                                _hover={{ bg: "#00457C" }}
                            >
                                Simpan
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

            {/* --- DIALOG TAMBAH STOK --- */}
            <Dialog.Root open={isStokOpen} onOpenChange={(e) => setIsStokOpen(e.open)}>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="500px" borderRadius="xl" shadow="xl">
                        <Dialog.Header borderBottom="1px solid" borderColor="gray.200" pb={4}>
                            <Dialog.Title fontSize="xl" fontWeight="bold" color="gray.800">
                                Tambah Stok: {selectedBarang?.nama}
                            </Dialog.Title>
                            <Dialog.CloseTrigger />
                        </Dialog.Header>
                        <Dialog.Body py={6}>
                            <VStack gap={5}>
                                <Field.Root required w="full">
                                    <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Jumlah Masuk</Field.Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={jumlahStok} 
                                        onChange={(e) => setJumlahStok(e.target.value)}
                                        size="lg"
                                        borderRadius="lg"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                    />
                                </Field.Root>

                                <Field.Root w="full">
                                    <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Harga Satuan (Opsional)</Field.Label>
                                    <Input
                                        type="number"
                                        placeholder="Rp 0"
                                        value={hargaSatuan} 
                                        onChange={(e) => setHargaSatuan(e.target.value)}
                                        size="lg"
                                        borderRadius="lg"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                    />
                                </Field.Root>

                                <Field.Root w="full">
                                    <Field.Label fontWeight="semibold" color="gray.700" mb={2}>Tanggal Masuk</Field.Label>
                                    <Input
                                        type="date"
                                        value={tanggalMasuk} 
                                        onChange={(e) => setTanggalMasuk(e.target.value)}
                                        size="lg"
                                        borderRadius="lg"
                                        border="2px solid"
                                        borderColor="gray.200"
                                        _focus={{ borderColor: BPS_BLUE, shadow: "0 0 0 3px rgba(0, 93, 166, 0.1)" }}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer borderTop="1px solid" borderColor="gray.200" pt={4} gap={3}>
                            <Button 
                                variant="outline" 
                                onClick={() => setIsStokOpen(false)}
                                size="lg"
                                px={6}
                                borderColor="gray.300"
                                _hover={{ bg: "gray.50" }}
                            >
                                Batal
                            </Button>
                            <Button 
                                colorPalette="green" 
                                onClick={handleAddStok}
                                size="lg"
                                px={6}
                            >
                                Tambah Stok
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>

        </Box>
    );
}