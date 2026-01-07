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
    Group,
    NumberInput,
    Field,
    Alert,
    Separator,
    Progress,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCamera, FiSearch, FiPackage, FiPlus } from "react-icons/fi";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    barcode: string | null;
}

export default function AdminScanPage() {
    const [barcode, setBarcode] = useState("");
    const [foundBarang, setFoundBarang] = useState<Barang | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [jumlah, setJumlah] = useState("1");
    const [loading, setLoading] = useState(false);

    const showToast = (title: string, type: "success") => {
        toaster.create({ title, type });
    };

    const lookupBarang = async () => {
        if (!barcode) return;
        const res = await fetch("/api/barang");
        const list: Barang[] = await res.json();
        const found = list.find((b) => b.barcode === barcode);
        if (found) {
            setFoundBarang(found);
            setNotFound(false);
        } else {
            setFoundBarang(null);
            setNotFound(true);
        }
    };

    const handleAddStock = async () => {
        if (!foundBarang) return;
        setLoading(true);
        await fetch("/api/stok", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                barangId: foundBarang.id,
                jumlah: parseInt(jumlah),
                tanggalMasuk: new Date().toISOString(),
            }),
        });
        showToast(`Stok ${foundBarang.nama} +${jumlah}`, "success");
        setFoundBarang(null);
        setBarcode("");
        setJumlah("1");
        setLoading(false);
    };

    return (
        <Box maxW="600px">
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Scan Barcode</Heading>
                <Text color="gray.500">Scan atau input barcode untuk tambah stok cepat</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Header pb={2}>
                    <Text fontWeight="semibold">Input Barcode</Text>
                </Card.Header>
                <Card.Body pt={0}>
                    <HStack>
                        <Group flex={1}>
                            <FiCamera />
                            <Input
                                placeholder="Scan atau ketik barcode..."
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && lookupBarang()}
                            />
                        </Group>
                        <Button colorPalette="blue" onClick={lookupBarang}>
                            <FiSearch />
                            Cari
                        </Button>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                        Tekan Enter atau klik Cari setelah scan/input barcode
                    </Text>
                </Card.Body>
            </Card.Root>

            {notFound && (
                <Alert.Root status="warning" borderRadius="lg" mb={6}>
                    <Alert.Indicator />
                    <Alert.Content>
                        Barcode tidak ditemukan: <strong>{barcode}</strong>
                    </Alert.Content>
                </Alert.Root>
            )}

            {foundBarang && (
                <Card.Root>
                    <Card.Header bg="green.50" borderTopRadius="lg">
                        <HStack>
                            <FiPackage color="green" />
                            <Text fontWeight="semibold" color="green.700">Barang Ditemukan</Text>
                        </HStack>
                    </Card.Header>
                    <Card.Body>
                        <VStack align="stretch" gap={4}>
                            <Box>
                                <Text fontSize="xl" fontWeight="bold">{foundBarang.nama}</Text>
                                <Text color="gray.500">Stok saat ini: {foundBarang.stokTotal} {foundBarang.satuan}</Text>
                            </Box>

                            <Separator />

                            <Field.Root>
                                <Field.Label>Jumlah yang ditambahkan</Field.Label>
                                <NumberInput.Root value={jumlah} onValueChange={(e) => setJumlah(e.value)} min={1}>
                                    <NumberInput.Input />
                                    <NumberInput.Control>
                                        <NumberInput.IncrementTrigger />
                                        <NumberInput.DecrementTrigger />
                                    </NumberInput.Control>
                                </NumberInput.Root>
                            </Field.Root>

                            <HStack>
                                <Button
                                    colorPalette="green"
                                    flex={1}
                                    onClick={handleAddStock}
                                    loading={loading}
                                >
                                    <FiPlus />
                                    Tambah Stok
                                </Button>
                                <Button variant="ghost" onClick={() => { setFoundBarang(null); setBarcode(""); }}>
                                    Batal
                                </Button>
                            </HStack>
                        </VStack>
                    </Card.Body>
                </Card.Root>
            )}
        </Box>
    );
}
