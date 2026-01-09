"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Box,
    SimpleGrid,
    Flex,
    Heading,
    Text,
    Icon,
    Card,
    HStack,
    Badge,
    Table,
    Button,
    Skeleton
} from "@chakra-ui/react";
import {
    FiPackage,
    FiLayers,
    FiClock,
    FiCheckCircle,
    FiTrendingUp,
    FiArrowRight
} from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

// Tipe data (sesuaikan dengan return API)
interface DashboardData {
    totalBarang: number;
    totalStok: number;
    pendingRequests: number;
    approvedRequests: number;
    recentRequests: any[];
}

// --- KOMPONEN STAT CARD ---
const DashboardStatCard = ({ label, value, icon, color, bgIcon, helpText, loading }: any) => (
    <Card.Root
        bg="white"
        shadow="sm"
        border="1px solid"
        borderColor="gray.200"
        transition="transform 0.2s"
        _hover={{ transform: "translateY(-2px)", shadow: "md" }}
    >
        <Card.Body p={6}>
            <Flex justify="space-between" align="start">
                <Box w="full">
                    <Text fontSize="sm" fontWeight="medium" color="gray.500">
                        {label}
                    </Text>
                    {loading ? (
                        <Skeleton height="32px" width="60%" mt={2} mb={1} />
                    ) : (
                        <Heading size="3xl" mt={2} mb={1} color="gray.800">
                            {value?.toLocaleString('id-ID')}
                        </Heading>
                    )}
                    <Text fontSize="xs" color="gray.400">
                        {helpText}
                    </Text>
                </Box>
                <Flex
                    w={12} h={12}
                    align="center" justify="center"
                    bg={bgIcon}
                    borderRadius="xl"
                    color={color}
                    flexShrink={0}
                >
                    <Icon as={icon} boxSize={6} />
                </Flex>
            </Flex>
        </Card.Body>
    </Card.Root>
);

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetching Client Side
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/dashboard");
                if (!res.ok) throw new Error("Gagal mengambil data");
                const json = await res.json();
                setData(json);
            } catch (error) {
                toaster.create({ title: "Gagal memuat dashboard", type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Warna BPS
    const BPS_BLUE = "#005DA6";
    const BPS_ORANGE = "#F7931E";
    const BPS_GREEN = "#8CC63F";

    return (
        <Box>
            {/* --- HEADER SECTION --- */}
            <Box mb={8}>
                <Heading size="xl" color="gray.800" mb={2}>
                    Dashboard Overview
                </Heading>
                <Text color="gray.600">
                    Selamat datang kembali di Sistem Logistik BPS.
                </Text>
            </Box>

            {/* --- STATS GRID --- */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={10}>
                <DashboardStatCard
                    loading={loading}
                    label="Total Aset Barang"
                    value={data?.totalBarang}
                    icon={FiPackage}
                    color={BPS_BLUE}
                    bgIcon="blue.50"
                    helpText="Jenis barang terdaftar"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Total Stok Unit"
                    value={data?.totalStok}
                    icon={FiLayers}
                    color="purple.500"
                    bgIcon="purple.50"
                    helpText="Akumulasi seluruh stok"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Menunggu Persetujuan"
                    value={data?.pendingRequests}
                    icon={FiClock}
                    color={BPS_ORANGE}
                    bgIcon="orange.50"
                    helpText="Perlu tindakan segera"
                />
                <DashboardStatCard
                    loading={loading}
                    label="Permintaan Selesai"
                    value={data?.approvedRequests}
                    icon={FiCheckCircle}
                    color={BPS_GREEN}
                    bgIcon="green.50"
                    helpText="Total disetujui bulan ini"
                />
            </SimpleGrid>

            {/* --- RECENT ACTIVITY SECTION --- */}
            <Flex direction={{ base: "column", lg: "row" }} gap={8}>

                {/* Kolom Kiri: Tabel Recent Request */}
                <Box
                    flex={2}
                    bg="white"
                    borderRadius="xl"
                    shadow="sm"
                    border="1px solid"
                    borderColor="gray.200"
                    overflow="hidden"
                >
                    <Flex p={6} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
                        <HStack>
                            <Icon as={FiTrendingUp} color={BPS_BLUE} />
                            <Heading size="md" color="gray.800">Permintaan Terbaru</Heading>
                        </HStack>
                        <Button size="xs" variant="ghost" asChild color="blue.600">
                            <Link href="/admin/request">Lihat Semua</Link>
                        </Button>
                    </Flex>

                    <Box overflowX="auto">
                        <Table.Root size="sm" striped interactive>
                            <Table.Header bg="gray.50">
                                <Table.Row>
                                    <Table.ColumnHeader color="gray.600">ID & Tanggal</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.600">Pemohon</Table.ColumnHeader>
                                    <Table.ColumnHeader color="gray.600">Status</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="right"></Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {loading ? (
                                    // Skeleton Row saat Loading
                                    [1, 2, 3].map((i) => (
                                        <Table.Row key={i}>
                                            <Table.Cell><Skeleton height="20px" /></Table.Cell>
                                            <Table.Cell><Skeleton height="20px" /></Table.Cell>
                                            <Table.Cell><Skeleton height="20px" /></Table.Cell>
                                            <Table.Cell><Skeleton height="20px" /></Table.Cell>
                                        </Table.Row>
                                    ))
                                ) : data?.recentRequests.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={4} textAlign="center" py={8} color="gray.500">
                                            Belum ada data permintaan.
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    data?.recentRequests.map((req) => (
                                        <Table.Row key={req.id} _hover={{ bg: "blue.50" }}>
                                            <Table.Cell>
                                                <Box>
                                                    <Text fontWeight="medium" fontSize="xs" color="gray.800">{req.id.substring(0, 8)}...</Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </Text>
                                                </Box>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm" color="gray.800">{req.user?.nama || 'Unknown'}</Text>
                                                <Text fontSize="xs" color="gray.500">{req.user?.email}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge
                                                    variant="subtle"
                                                    colorPalette={
                                                        req.status === 'APPROVED' ? 'green' :
                                                            req.status === 'REJECTED' ? 'red' : 'orange'
                                                    }
                                                >
                                                    {req.status}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <Button size="xs" variant="ghost" asChild>
                                                    <Link href={`/admin/request/${req.id}`}><FiArrowRight /></Link>
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Box>

                {/* Kolom Kanan: Quick Action */}
                <Box flex={1}>
                    <Box
                        bg={BPS_BLUE}
                        borderRadius="xl"
                        p={6}
                        color="white"
                        mb={6}
                        bgImage="linear-gradient(to bottom right, #005DA6, #00457C)"
                    >
                        <Heading size="md" mb={2}>Laporan Bulanan</Heading>
                        <Text fontSize="sm" opacity={0.9} mb={4}>
                            Unduh rekapitulasi stok masuk dan keluar periode ini.
                        </Text>
                        <Button bg="white" color={BPS_BLUE} size="sm" w="full" _hover={{ bg: "gray.100" }}>
                            Unduh Laporan Excel
                        </Button>
                    </Box>

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="xl"
                        p={6}
                    >
                        <Heading size="sm" mb={4} color="gray.700">Status Sistem</Heading>
                        <HStack justify="space-between" mb={2}>
                            <Text fontSize="sm" color="gray.500">Server</Text>
                            <Badge colorPalette="green" variant="solid">Online</Badge>
                        </HStack>
                        <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.500">Database</Text>
                            <Badge colorPalette="green" variant="solid">Connected</Badge>
                        </HStack>
                    </Box>
                </Box>

            </Flex>
        </Box>
    );
}