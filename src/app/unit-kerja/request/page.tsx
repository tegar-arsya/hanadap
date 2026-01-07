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
    Badge,
    Field,
    Alert,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiSend, FiInfo } from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
}

interface RequestItem {
    barangId: string;
    barang: Barang;
    jumlah: number;
}

export default function UnitKerjaRequestPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [items, setItems] = useState<RequestItem[]>([]);
    const [selectedBarang, setSelectedBarang] = useState("");
    const [jumlah, setJumlah] = useState("1");
    const [catatan, setCatatan] = useState("");
    const [loading, setLoading] = useState(false);

    const showToast = (title: string, type: "success" | "error" | "warning") => {
        toaster.create({ title, type });
    };

    useEffect(() => {
        fetch("/api/barang")
            .then((res) => res.json())
            .then((data) => setBarangList(data.filter((b: Barang) => b.stokTotal > 0)));
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
        if (items.length === 0) {
            showToast("Tambahkan minimal 1 barang", "warning");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    catatan,
                    items: items.map((i) => ({ barangId: i.barangId, jumlahDiminta: i.jumlah })),
                }),
            });

            if (res.ok) {
                showToast("Permintaan berhasil diajukan", "success");
                setItems([]);
                setCatatan("");
            } else {
                showToast("Gagal mengajukan permintaan", "error");
            }
        } catch (error) {
            showToast("Terjadi kesalahan", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Ajukan Permintaan"
                description="Request barang dari gudang"
            />

            <Card title="Tambah Barang">
                <HStack gap={4} align="end" flexWrap={{ base: "wrap", md: "nowrap" }}>
                    <Field.Root flex={2} minW={{ base: "full", md: "auto" }}>
                        <Field.Label fontSize="sm" color="var(--foreground)">Barang</Field.Label>
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                value={selectedBarang}
                                onChange={(e) => setSelectedBarang(e.target.value)}
                                bg="var(--input-bg)"
                                borderColor="var(--input-border)"
                                color="var(--foreground)"
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
                        <Field.Label fontSize="sm" color="var(--foreground)">Jumlah</Field.Label>
                        <NumberInput.Root min={1} value={jumlah} onValueChange={(e) => setJumlah(e.value)}>
                            <NumberInput.Input bg="var(--input-bg)" borderColor="var(--input-border)" color="var(--foreground)" />
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
            </Card>

            {items.length > 0 && (
                <Box mt={4}>
                    <Card
                        title="Daftar Permintaan"
                        actions={<Badge colorPalette="blue">{items.length} item</Badge>}
                    >
                        <Box overflowX="auto" mx={-5} borderTop="1px solid" borderColor="var(--card-border)">
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="var(--table-header-bg)">
                                        <Table.ColumnHeader px={5} py={2} color="var(--sidebar-text-muted)" fontSize="xs">Barang</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={2} color="var(--sidebar-text-muted)" fontSize="xs" textAlign="right">Jumlah</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={2} w="50px"></Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {items.map((item) => (
                                        <Table.Row key={item.barangId} _hover={{ bg: "var(--table-row-hover)" }}>
                                            <Table.Cell px={5} py={2} color="var(--foreground)">{item.barang.nama}</Table.Cell>
                                            <Table.Cell px={5} py={2} textAlign="right" color="var(--foreground)">{item.jumlah} {item.barang.satuan}</Table.Cell>
                                            <Table.Cell px={5} py={2}>
                                                <IconButton
                                                    aria-label="Remove"
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

                        <Box mt={4} pt={4} borderTop="1px solid" borderColor="var(--card-border)">
                            <Field.Root mb={4}>
                                <Field.Label fontSize="sm" color="var(--foreground)">Catatan (opsional)</Field.Label>
                                <Textarea
                                    value={catatan}
                                    onChange={(e) => setCatatan(e.target.value)}
                                    placeholder="Tambahkan catatan jika perlu..."
                                    bg="var(--input-bg)"
                                    borderColor="var(--input-border)"
                                    color="var(--foreground)"
                                />
                            </Field.Root>

                            <Button
                                colorPalette="green"
                                size="lg"
                                w="full"
                                onClick={handleSubmit}
                                loading={loading}
                            >
                                <FiSend />
                                Kirim Permintaan
                            </Button>
                        </Box>
                    </Card>
                </Box>
            )}

            {items.length === 0 && (
                <Box mt={4}>
                    <Alert.Root status="info" borderRadius="lg" bg="var(--stat-blue-bg)">
                        <Alert.Indicator color="var(--stat-blue-color)" />
                        <Alert.Content color="var(--stat-blue-color)">
                            Pilih barang dan jumlah untuk memulai permintaan
                        </Alert.Content>
                    </Alert.Root>
                </Box>
            )}
        </>
    );
}
