"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    SimpleGrid,
    Card,
    Badge,
    Input,
    Group,
    HStack,
    Progress,
} from "@chakra-ui/react";
import { FiSearch, FiPackage } from "react-icons/fi";

interface Barang {
    id: string;
    nama: string;
    satuan: string;
    stokTotal: number;
    stokMinimum: number;
    kategori?: { nama: string };
}

export default function UnitKerjaStokPage() {
    const [barangList, setBarangList] = useState<Barang[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/api/barang")
            .then((res) => res.json())
            .then((data) => setBarangList(data))
            .finally(() => setLoading(false));
    }, []);

    const filteredBarang = barangList.filter((b) =>
        b.nama.toLowerCase().includes(search.toLowerCase())
    );

    const getStokColor = (stok: number, min: number) => {
        if (stok <= 0) return "red";
        if (stok <= min) return "orange";
        return "green";
    };

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Lihat Stok</Heading>
                <Text color="gray.500">Daftar barang yang tersedia</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Body>
                    <Group>
                        <FiSearch color="gray" />
                        <Input
                            placeholder="Cari barang..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Group>
                </Card.Body>
            </Card.Root>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {filteredBarang.map((barang) => {
                    const color = getStokColor(barang.stokTotal, barang.stokMinimum);
                    const progressValue = Math.min((barang.stokTotal / (barang.stokMinimum * 3)) * 100, 100);

                    return (
                        <Card.Root key={barang.id}>
                            <Card.Body>
                                <VStack align="stretch" gap={3}>
                                    <HStack justify="space-between">
                                        <HStack>
                                            <FiPackage color="gray" />
                                            <Text fontWeight="semibold" lineClamp={1}>
                                                {barang.nama}
                                            </Text>
                                        </HStack>
                                        <Badge colorPalette={color}>
                                            {barang.stokTotal <= 0
                                                ? "Habis"
                                                : barang.stokTotal <= barang.stokMinimum
                                                    ? "Menipis"
                                                    : "Tersedia"}
                                        </Badge>
                                    </HStack>

                                    <Progress.Root value={progressValue} colorPalette={color} size="sm">
                                        <Progress.Track borderRadius="full">
                                            <Progress.Range />
                                        </Progress.Track>
                                    </Progress.Root>

                                    <HStack justify="space-between" fontSize="sm" color="gray.500">
                                        <Text>
                                            Stok: <strong>{barang.stokTotal}</strong> {barang.satuan}
                                        </Text>
                                        <Text>Min: {barang.stokMinimum}</Text>
                                    </HStack>

                                    {barang.kategori && (
                                        <Badge variant="subtle" colorPalette="gray" w="fit-content">
                                            {barang.kategori.nama}
                                        </Badge>
                                    )}
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    );
                })}
            </SimpleGrid>

            {filteredBarang.length === 0 && !loading && (
                <Card.Root>
                    <Card.Body textAlign="center" py={10}>
                        <Text color="gray.500">Tidak ada barang ditemukan</Text>
                    </Card.Body>
                </Card.Root>
            )}
        </Box>
    );
}
