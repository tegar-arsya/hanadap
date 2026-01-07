"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    CardHeader,
    Button,
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    FormControl,
    FormLabel,
    Textarea,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    useToast,
    Divider,
} from "@chakra-ui/react";
import { FiCornerDownLeft, FiSend } from "react-icons/fi";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
}

interface ReturnHistory {
    id: string;
    createdAt: string;
    jumlah: number;
    keterangan: string;
    barang: { nama: string; satuan: string };
}

export default function UnitKerjaReturnPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [history, setHistory] = useState<ReturnHistory[]>([]);
    const [selectedBarang, setSelectedBarang] = useState("");
    const [jumlah, setJumlah] = useState(1);
    const [keterangan, setKeterangan] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetch("/api/barang").then((res) => res.json()).then(setBarangList);
        fetch("/api/return").then((res) => res.json()).then(setHistory);
    }, []);

    const handleSubmit = async () => {
        if (!selectedBarang) return;
        setLoading(true);
        const res = await fetch("/api/return", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barangId: selectedBarang, jumlah, keterangan }),
        });

        if (res.ok) {
            toast({ title: "Pengembalian berhasil dicatat", status: "success" });
            setSelectedBarang("");
            setJumlah(1);
            setKeterangan("");
            const updatedHistory = await fetch("/api/return").then((r) => r.json());
            setHistory(updatedHistory);
        } else {
            toast({ title: "Gagal mencatat pengembalian", status: "error" });
        }
        setLoading(false);
    };

    return (
        <Box>
            <VStack align="start" spacing={1} mb={8}>
                <Heading size="lg">Pengembalian Barang</Heading>
                <Text color="gray.500">Kembalikan barang yang tidak terpakai</Text>
            </VStack>

            <Card mb={6}>
                <CardHeader>
                    <HStack>
                        <FiCornerDownLeft />
                        <Text fontWeight="semibold">Form Pengembalian</Text>
                    </HStack>
                </CardHeader>
                <CardBody pt={0}>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Barang</FormLabel>
                            <Select
                                placeholder="Pilih barang"
                                value={selectedBarang}
                                onChange={(e) => setSelectedBarang(e.target.value)}
                            >
                                {barangList.map((b) => (
                                    <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Jumlah</FormLabel>
                            <NumberInput value={jumlah} onChange={(_, v) => setJumlah(v)} min={1}>
                                <NumberInputField />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Keterangan</FormLabel>
                            <Textarea
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Alasan pengembalian (opsional)"
                            />
                        </FormControl>

                        <Button
                            leftIcon={<FiSend />}
                            colorScheme="green"
                            w="full"
                            onClick={handleSubmit}
                            isLoading={loading}
                            isDisabled={!selectedBarang}
                        >
                            Kembalikan Barang
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <Text fontWeight="semibold">Riwayat Pengembalian</Text>
                </CardHeader>
                <CardBody pt={0}>
                    {history.length === 0 ? (
                        <Text color="gray.500" textAlign="center" py={6}>Belum ada pengembalian</Text>
                    ) : (
                        <Table size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Tanggal</Th>
                                    <Th>Barang</Th>
                                    <Th isNumeric>Jumlah</Th>
                                    <Th>Keterangan</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {history.map((item) => (
                                    <Tr key={item.id}>
                                        <Td>{new Date(item.createdAt).toLocaleDateString("id-ID")}</Td>
                                        <Td>{item.barang.nama}</Td>
                                        <Td isNumeric>{item.jumlah} {item.barang.satuan}</Td>
                                        <Td>{item.keterangan || "-"}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </CardBody>
            </Card>
        </Box>
    );
}
