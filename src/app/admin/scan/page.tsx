"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    Group,
    NumberInput,
    Field,
    Alert,
    Separator,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCamera, FiSearch, FiPackage, FiPlus } from "react-icons/fi";
import { PageHeader, Card, PrimaryButton, StyledInput } from "@/components/ui/shared";

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
            <PageHeader title="Scan Barcode" subtitle="Scan atau input barcode untuk tambah stok cepat" />

            <Card style={{ marginBottom: "1.5rem" }}>
                <Text fontWeight="semibold" mb={3} style={{ color: "var(--foreground)" }}>Input Barcode</Text>
                <HStack>
                    <Group flex={1}>
                        <Box style={{ color: "var(--muted-foreground)" }}>
                            <FiCamera />
                        </Box>
                        <StyledInput
                            placeholder="Scan atau ketik barcode..."
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && lookupBarang()}
                        />
                    </Group>
                    <PrimaryButton onClick={lookupBarang}>
                        <FiSearch />
                        Cari
                    </PrimaryButton>
                </HStack>
                <Text fontSize="sm" mt={2} style={{ color: "var(--muted-foreground)" }}>
                    Tekan Enter atau klik Cari setelah scan/input barcode
                </Text>
            </Card>

            {notFound && (
                <Alert.Root
                    status="warning"
                    borderRadius="lg"
                    mb={6}
                    style={{
                        background: "var(--stat-orange-bg)",
                        borderColor: "var(--stat-orange-color)",
                    }}
                >
                    <Alert.Indicator />
                    <Alert.Content style={{ color: "var(--stat-orange-color)" }}>
                        Barcode tidak ditemukan: <strong>{barcode}</strong>
                    </Alert.Content>
                </Alert.Root>
            )}

            {foundBarang && (
                <Card>
                    <HStack mb={4}>
                        <Box style={{ color: "var(--stat-green-color)" }}>
                            <FiPackage />
                        </Box>
                        <Text fontWeight="semibold" style={{ color: "var(--stat-green-color)" }}>
                            Barang Ditemukan
                        </Text>
                    </HStack>

                    <VStack align="stretch" gap={4}>
                        <Box>
                            <Text fontSize="xl" fontWeight="bold" style={{ color: "var(--foreground)" }}>
                                {foundBarang.nama}
                            </Text>
                            <Text style={{ color: "var(--muted-foreground)" }}>
                                Stok saat ini: {foundBarang.stokTotal} {foundBarang.satuan}
                            </Text>
                        </Box>

                        <Separator style={{ borderColor: "var(--card-border)" }} />

                        <Field.Root>
                            <Field.Label style={{ color: "var(--foreground)" }}>Jumlah yang ditambahkan</Field.Label>
                            <NumberInput.Root value={jumlah} onValueChange={(e) => setJumlah(e.value)} min={1}>
                                <NumberInput.Input
                                    style={{
                                        background: "var(--input-bg)",
                                        borderColor: "var(--input-border)",
                                        color: "var(--foreground)",
                                    }}
                                />
                                <NumberInput.Control>
                                    <NumberInput.IncrementTrigger style={{ color: "var(--foreground)" }} />
                                    <NumberInput.DecrementTrigger style={{ color: "var(--foreground)" }} />
                                </NumberInput.Control>
                            </NumberInput.Root>
                        </Field.Root>

                        <HStack>
                            <Button
                                flex={1}
                                onClick={handleAddStock}
                                loading={loading}
                                style={{
                                    background: "var(--stat-green-color)",
                                    color: "white",
                                    fontWeight: 600,
                                }}
                            >
                                <FiPlus />
                                Tambah Stok
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => { setFoundBarang(null); setBarcode(""); }}
                                style={{ color: "var(--foreground)" }}
                            >
                                Batal
                            </Button>
                        </HStack>
                    </VStack>
                </Card>
            )}
        </Box>
    );
}
