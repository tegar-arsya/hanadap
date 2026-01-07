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
    NativeSelect,
    NumberInput,
    Textarea,
    Table,
    IconButton,
    Badge,
    Separator,
    Field,
    Alert,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiSend } from "react-icons/fi";

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
                    items: items.map((i) => ({ barangId: i.barangId, jumlah: i.jumlah })),
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
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Ajukan Permintaan</Heading>
                <Text color="gray.500">Request barang dari gudang</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Header>
                    <Text fontWeight="semibold">Tambah Barang</Text>
                </Card.Header>
                <Card.Body pt={0}>
                    <HStack gap={4} align="end">
                        <Field.Root flex={2}>
                            <Field.Label fontSize="sm">Barang</Field.Label>
                            <NativeSelect.Root>
                                <NativeSelect.Field
                                    value={selectedBarang}
                                    onChange={(e) => setSelectedBarang(e.target.value)}
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
                        <Field.Root flex={1}>
                            <Field.Label fontSize="sm">Jumlah</Field.Label>
                            <NumberInput.Root min={1} value={jumlah} onValueChange={(e) => setJumlah(e.value)}>
                                <NumberInput.Input />
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
                </Card.Body>
            </Card.Root>

            {items.length > 0 && (
                <Card.Root mb={6}>
                    <Card.Header>
                        <HStack justify="space-between">
                            <Text fontWeight="semibold">Daftar Permintaan</Text>
                            <Badge colorPalette="blue">{items.length} item</Badge>
                        </HStack>
                    </Card.Header>
                    <Card.Body pt={0}>
                        <Table.Root size="sm">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Barang</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="right">Jumlah</Table.ColumnHeader>
                                    <Table.ColumnHeader w="50px"></Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {items.map((item) => (
                                    <Table.Row key={item.barangId}>
                                        <Table.Cell>{item.barang.nama}</Table.Cell>
                                        <Table.Cell textAlign="right">{item.jumlah} {item.barang.satuan}</Table.Cell>
                                        <Table.Cell>
                                            <IconButton
                                                aria-label="Remove"
                                                size="sm"
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

                        <Separator my={4} />

                        <Field.Root mb={4}>
                            <Field.Label fontSize="sm">Catatan (opsional)</Field.Label>
                            <Textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Tambahkan catatan jika perlu..."
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
                    </Card.Body>
                </Card.Root>
            )}

            {items.length === 0 && (
                <Alert.Root status="info" borderRadius="lg">
                    <Alert.Indicator />
                    <Alert.Content>
                        Pilih barang dan jumlah untuk memulai permintaan
                    </Alert.Content>
                </Alert.Root>
            )}
        </Box>
    );
}
