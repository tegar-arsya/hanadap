"use client";

import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Button,
    NativeSelect,
    NumberInput,
    Textarea,
    Table,
    IconButton,
    Field,
    Input,
    Text,
    Heading,
    Container,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiSend, FiPackage } from "react-icons/fi";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
}

interface UnitKerja {
    id: string;
    nama: string;
    kode: string;
}

interface RequestItem {
    barangId: string;
    barang: Barang;
    jumlah: number;
}

export default function PublicRequestPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
    const [items, setItems] = useState<RequestItem[]>([]);
    const [selectedBarang, setSelectedBarang] = useState("");
    const [jumlah, setJumlah] = useState("1");
    const [catatan, setCatatan] = useState("");
    const [loading, setLoading] = useState(false);

    // Form pemohon
    const [namaPemohon, setNamaPemohon] = useState("");
    const [emailPemohon, setEmailPemohon] = useState("");
    const [unitKerjaId, setUnitKerjaId] = useState("");

    const showToast = (title: string, type: "success" | "error" | "warning") => {
        toaster.create({ title, type });
    };

    useEffect(() => {
        // Fetch barang
        fetch("/api/barang")
            .then((res) => res.json())
            .then((data) => setBarangList(data.filter((b: Barang) => b.stokTotal > 0)))
            .catch(() => {});

        // Fetch unit kerja
        fetch("/api/unit-kerja")
            .then((res) => res.json())
            .then((data) => setUnitKerjaList(data))
            .catch(() => {});
    }, []);

    const handleAddItem = () => {
        const barang = barangList.find((b) => b.id === selectedBarang);
        if (!barang) return;

        if (items.some((i) => i.barangId === selectedBarang)) {
            showToast("Barang sudah ditambahkan", "warning");
            return;
        }

        setItems([...items, { barangId: selectedBarang, barang, jumlah: parseInt(jumlah) }]);
        setSelectedBarang("");
        setJumlah("1");
    };

    const handleRemoveItem = (barangId: string) => {
        setItems(items.filter((i) => i.barangId !== barangId));
    };

    const handleSubmit = async () => {
        if (!namaPemohon || !emailPemohon || !unitKerjaId) {
            showToast("Lengkapi data pemohon", "warning");
            return;
        }

        if (items.length === 0) {
            showToast("Tambahkan minimal 1 barang", "warning");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/request/public", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    namaPemohon,
                    emailPemohon,
                    unitKerjaId,
                    catatan,
                    items: items.map((i) => ({ barangId: i.barangId, jumlahDiminta: i.jumlah })),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                showToast("Permintaan berhasil diajukan!", "success");
                setItems([]);
                setCatatan("");
                setNamaPemohon("");
                setEmailPemohon("");
                setUnitKerjaId("");
                // Redirect to tracking page
                window.location.href = `/tracking?id=${data.id}`;
            } else {
                const error = await res.json();
                showToast(error.error || "Gagal mengajukan permintaan", "error");
            }
        } catch (error) {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={8}>
            <Container maxW="container.md">
                <VStack gap={6} align="stretch">
                    {/* Header */}
                    <Box textAlign="center" mb={4}>
                        <HStack justify="center" mb={2}>
                            <FiPackage size={32} color="#3182ce" />
                        </HStack>
                        <Heading size="lg" color="gray.800">Form Permintaan Barang</Heading>
                        <Text color="gray.600" mt={1}>Hanadap - Sistem Manajemen Inventori</Text>
                    </Box>

                    {/* Data Pemohon */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                        <Heading size="md" mb={4} color="gray.700">Data Pemohon</Heading>
                        <VStack gap={4}>
                            <Field.Root required>
                                <Field.Label color="gray.700">Nama Lengkap</Field.Label>
                                <Input
                                    value={namaPemohon}
                                    onChange={(e) => setNamaPemohon(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    bg="white"
                                    borderColor="gray.300"
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label color="gray.700">Email</Field.Label>
                                <Input
                                    type="email"
                                    value={emailPemohon}
                                    onChange={(e) => setEmailPemohon(e.target.value)}
                                    placeholder="email@contoh.com"
                                    bg="white"
                                    borderColor="gray.300"
                                />
                            </Field.Root>
                            <Field.Root required>
                                <Field.Label color="gray.700">Unit Kerja</Field.Label>
                                <NativeSelect.Root>
                                    <NativeSelect.Field
                                        value={unitKerjaId}
                                        onChange={(e) => setUnitKerjaId(e.target.value)}
                                        bg="white"
                                        borderColor="gray.300"
                                    >
                                        <option value="">Pilih unit kerja</option>
                                        {unitKerjaList.map((uk) => (
                                            <option key={uk.id} value={uk.id}>
                                                {uk.nama} ({uk.kode})
                                            </option>
                                        ))}
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            </Field.Root>
                        </VStack>
                    </Box>

                    {/* Tambah Barang */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                        <Heading size="md" mb={4} color="gray.700">Tambah Barang</Heading>
                        <HStack gap={4} align="end" flexWrap={{ base: "wrap", md: "nowrap" }}>
                            <Field.Root flex={2} minW={{ base: "full", md: "auto" }}>
                                <Field.Label color="gray.700">Barang</Field.Label>
                                <NativeSelect.Root>
                                    <NativeSelect.Field
                                        value={selectedBarang}
                                        onChange={(e) => setSelectedBarang(e.target.value)}
                                        bg="white"
                                        borderColor="gray.300"
                                    >
                                        <option value="">Pilih barang</option>
                                        {barangList.map((barang) => (
                                            <option key={barang.id} value={barang.id}>
                                                {barang.nama} (stok: {barang.stokTotal})
                                            </option>
                                        ))}
                                    </NativeSelect.Field>
                                </NativeSelect.Root>
                            </Field.Root>
                            <Field.Root flex={1} minW={{ base: "120px", md: "auto" }}>
                                <Field.Label color="gray.700">Jumlah</Field.Label>
                                <NumberInput.Root min={1} value={jumlah} onValueChange={(e) => setJumlah(e.value)}>
                                    <NumberInput.Input bg="white" borderColor="gray.300" />
                                    <NumberInput.Control>
                                        <NumberInput.IncrementTrigger />
                                        <NumberInput.DecrementTrigger />
                                    </NumberInput.Control>
                                </NumberInput.Root>
                            </Field.Root>
                            <Button
                                colorPalette="blue"
                                onClick={handleAddItem}
                                disabled={!selectedBarang}
                            >
                                <FiPlus />
                                Tambah
                            </Button>
                        </HStack>
                    </Box>

                    {/* Daftar Barang */}
                    {items.length > 0 && (
                        <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                            <Heading size="md" mb={4} color="gray.700">Daftar Barang Diminta</Heading>
                            <Box overflowX="auto">
                                <Table.Root size="sm">
                                    <Table.Header>
                                        <Table.Row bg="gray.50">
                                            <Table.ColumnHeader color="gray.600">Barang</Table.ColumnHeader>
                                            <Table.ColumnHeader color="gray.600" textAlign="right">Jumlah</Table.ColumnHeader>
                                            <Table.ColumnHeader color="gray.600">Satuan</Table.ColumnHeader>
                                            <Table.ColumnHeader color="gray.600"></Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {items.map((item) => (
                                            <Table.Row key={item.barangId}>
                                                <Table.Cell color="gray.800">{item.barang.nama}</Table.Cell>
                                                <Table.Cell textAlign="right" color="gray.800">{item.jumlah}</Table.Cell>
                                                <Table.Cell color="gray.600">{item.barang.satuan}</Table.Cell>
                                                <Table.Cell>
                                                    <IconButton
                                                        aria-label="Hapus"
                                                        size="xs"
                                                        colorPalette="red"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveItem(item.barangId)}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </Box>
                        </Box>
                    )}

                    {/* Catatan */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                        <Field.Root>
                            <Field.Label color="gray.700">Catatan (opsional)</Field.Label>
                            <Textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Catatan tambahan untuk permintaan ini..."
                                bg="white"
                                borderColor="gray.300"
                                rows={3}
                            />
                        </Field.Root>
                    </Box>

                    {/* Submit */}
                    <Button
                        colorPalette="blue"
                        size="lg"
                        onClick={handleSubmit}
                        loading={loading}
                        loadingText="Mengirim..."
                        disabled={items.length === 0 || !namaPemohon || !emailPemohon || !unitKerjaId}
                    >
                        <FiSend />
                        Kirim Permintaan
                    </Button>

                    {/* Link Tracking */}
                    <Box textAlign="center" mt={4}>
                        <Text color="gray.600" fontSize="sm">
                            Sudah mengajukan permintaan?{" "}
                            <a href="/tracking" style={{ color: "#3182ce", textDecoration: "underline" }}>
                                Cek status di sini
                            </a>
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}
