"use client";

import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    SimpleGrid,
    Badge,
    HStack,
    Progress,
    Text,
} from "@chakra-ui/react";
import { FiPackage } from "react-icons/fi";
import { PageHeader, Card, SearchInput, LoadingCard, EmptyCard } from "@/components/ui/shared";

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
        <>
            <PageHeader
                title="Lihat Stok"
                description="Daftar barang yang tersedia"
            />

            <Card>
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Cari barang..."
                />
            </Card>

            <Box mt={6}>
                {loading ? (
                    <LoadingCard />
                ) : filteredBarang.length === 0 ? (
                    <EmptyCard
                        icon={<FiPackage size={48} />}
                        message="Tidak ada barang ditemukan"
                        description="Coba ubah kata kunci pencarian"
                    />
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                        {filteredBarang.map((barang) => {
                            const color = getStokColor(barang.stokTotal, barang.stokMinimum);
                            const progressValue = Math.min((barang.stokTotal / (barang.stokMinimum * 3)) * 100, 100);

                            return (
                                <Box
                                    key={barang.id}
                                    bg="var(--card-bg)"
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="var(--card-border)"
                                    p={5}
                                    transition="all 0.2s"
                                    _hover={{ boxShadow: "var(--card-shadow)" }}
                                >
                                    <VStack align="stretch" gap={3}>
                                        <HStack justify="space-between">
                                            <HStack>
                                                <Box color="var(--sidebar-text-muted)">
                                                    <FiPackage size={18} />
                                                </Box>
                                                <Text fontWeight="semibold" lineClamp={1} color="var(--foreground)">
                                                    {barang.nama}
                                                </Text>
                                            </HStack>
                                            <Badge colorPalette={color} variant="subtle">
                                                {barang.stokTotal <= 0
                                                    ? "Habis"
                                                    : barang.stokTotal <= barang.stokMinimum
                                                        ? "Menipis"
                                                        : "Tersedia"}
                                            </Badge>
                                        </HStack>

                                        <Progress.Root value={progressValue} colorPalette={color} size="sm">
                                            <Progress.Track borderRadius="full" bg="var(--sidebar-hover)">
                                                <Progress.Range />
                                            </Progress.Track>
                                        </Progress.Root>

                                        <HStack justify="space-between" fontSize="sm" color="var(--sidebar-text-muted)">
                                            <Text>
                                                Stok: <Text as="span" fontWeight="semibold" color="var(--foreground)">{barang.stokTotal}</Text> {barang.satuan}
                                            </Text>
                                            <Text>Min: {barang.stokMinimum}</Text>
                                        </HStack>

                                        {barang.kategori && (
                                            <Badge variant="subtle" colorPalette="gray" w="fit-content">
                                                {barang.kategori.nama}
                                            </Badge>
                                        )}
                                    </VStack>
                                </Box>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Box>
        </>
    );
}
