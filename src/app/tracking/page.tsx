"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Box,
    VStack,
    HStack,
    Button,
    Input,
    Table,
    Text,
    Heading,
    Container,
    Badge,
    Field,
    Spinner,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiSearch, FiPackage, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

interface RequestItem {
    id: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: { nama: string; satuan: string };
}

interface RequestData {
    id: string;
    status: string;
    catatan: string | null;
    createdAt: string;
    updatedAt: string;
    user: { nama: string; email: string };
    items: RequestItem[];
}

function TrackingContent() {
    const searchParams = useSearchParams();
    const [requestId, setRequestId] = useState(searchParams.get("id") || "");
    const [email, setEmail] = useState("");
    const [requests, setRequests] = useState<RequestData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const showToast = (title: string, type: "success" | "error" | "info") => {
        toaster.create({ title, type });
    };

    // Auto search if ID provided in URL
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            setRequestId(id);
            handleSearchById(id);
        }
    }, [searchParams]);

    const handleSearchById = async (id: string) => {
        if (!id) {
            showToast("Masukkan ID permintaan", "info");
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/request/tracking?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(data ? [data] : []);
            } else {
                setRequests([]);
            }
        } catch (error) {
            showToast("Gagal mencari permintaan", "error");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByEmail = async () => {
        if (!email) {
            showToast("Masukkan email", "info");
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/request/tracking?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setRequests(Array.isArray(data) ? data : []);
            } else {
                setRequests([]);
            }
        } catch (error) {
            showToast("Gagal mencari permintaan", "error");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return (
                    <Badge colorPalette="orange">
                        <FiClock /> Menunggu
                    </Badge>
                );
            case "APPROVED":
                return (
                    <Badge colorPalette="green">
                        <FiCheckCircle /> Disetujui
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge colorPalette="red">
                        <FiXCircle /> Ditolak
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
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
                        <Heading size="lg" color="gray.800">Tracking Permintaan</Heading>
                        <Text color="gray.600" mt={1}>Cek status permintaan barang Anda</Text>
                    </Box>

                    {/* Search by ID */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                        <Field.Root>
                            <Field.Label color="gray.700">Cari berdasarkan ID Permintaan</Field.Label>
                            <HStack>
                                <Input
                                    value={requestId}
                                    onChange={(e) => setRequestId(e.target.value)}
                                    placeholder="Masukkan ID permintaan..."
                                    bg="white"
                                    borderColor="gray.300"
                                />
                                <Button colorPalette="blue" onClick={() => handleSearchById(requestId)} loading={loading}>
                                    <FiSearch />
                                    Cari
                                </Button>
                            </HStack>
                        </Field.Root>
                    </Box>

                    {/* OR Divider */}
                    <HStack>
                        <Box flex={1} h="1px" bg="gray.300" />
                        <Text color="gray.500" fontSize="sm" px={2}>ATAU</Text>
                        <Box flex={1} h="1px" bg="gray.300" />
                    </HStack>

                    {/* Search by Email */}
                    <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                        <Field.Root>
                            <Field.Label color="gray.700">Cari berdasarkan Email</Field.Label>
                            <HStack>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com"
                                    bg="white"
                                    borderColor="gray.300"
                                />
                                <Button colorPalette="blue" onClick={handleSearchByEmail} loading={loading}>
                                    <FiSearch />
                                    Cari
                                </Button>
                            </HStack>
                        </Field.Root>
                    </Box>

                    {/* Results */}
                    {searched && (
                        <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px solid" borderColor="gray.200">
                            <Heading size="md" mb={4} color="gray.700">Hasil Pencarian</Heading>
                            {loading ? (
                                <HStack justify="center" py={8}>
                                    <Spinner />
                                    <Text color="gray.600">Mencari...</Text>
                                </HStack>
                            ) : requests.length === 0 ? (
                                <Box textAlign="center" py={8}>
                                    <Text color="gray.500">Tidak ada permintaan ditemukan</Text>
                                </Box>
                            ) : (
                                <VStack gap={4} align="stretch">
                                    {requests.map((req) => (
                                        <Box
                                            key={req.id}
                                            p={4}
                                            borderRadius="md"
                                            border="1px solid"
                                            borderColor="gray.200"
                                            bg="gray.50"
                                        >
                                            <HStack justify="space-between" mb={3} flexWrap="wrap">
                                                <VStack align="start" gap={0}>
                                                    <Text fontSize="xs" color="gray.500">ID: {req.id}</Text>
                                                    <Text fontWeight="semibold" color="gray.800">{req.user.nama}</Text>
                                                    <Text fontSize="sm" color="gray.600">{req.user.email}</Text>
                                                </VStack>
                                                <VStack align="end" gap={1}>
                                                    {getStatusBadge(req.status)}
                                                    <Text fontSize="xs" color="gray.500">{formatDate(req.createdAt)}</Text>
                                                </VStack>
                                            </HStack>

                                            <Box overflowX="auto">
                                                <Table.Root size="sm">
                                                    <Table.Header>
                                                        <Table.Row bg="gray.100">
                                                            <Table.ColumnHeader color="gray.600">Barang</Table.ColumnHeader>
                                                            <Table.ColumnHeader color="gray.600" textAlign="right">Diminta</Table.ColumnHeader>
                                                            <Table.ColumnHeader color="gray.600" textAlign="right">Disetujui</Table.ColumnHeader>
                                                        </Table.Row>
                                                    </Table.Header>
                                                    <Table.Body>
                                                        {req.items.map((item) => (
                                                            <Table.Row key={item.id}>
                                                                <Table.Cell color="gray.800">{item.barang.nama}</Table.Cell>
                                                                <Table.Cell textAlign="right" color="gray.800">
                                                                    {item.jumlahDiminta} {item.barang.satuan}
                                                                </Table.Cell>
                                                                <Table.Cell textAlign="right" color={item.jumlahDisetujui > 0 ? "green.600" : "gray.400"}>
                                                                    {item.jumlahDisetujui > 0 ? `${item.jumlahDisetujui} ${item.barang.satuan}` : "-"}
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        ))}
                                                    </Table.Body>
                                                </Table.Root>
                                            </Box>

                                            {req.catatan && (
                                                <Text fontSize="sm" color="gray.600" mt={3}>
                                                    Catatan: {req.catatan}
                                                </Text>
                                            )}
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                        </Box>
                    )}

                    {/* Link back to request */}
                    <Box textAlign="center" mt={4}>
                        <Text color="gray.600" fontSize="sm">
                            Belum mengajukan permintaan?{" "}
                            <a href="/request" style={{ color: "#3182ce", textDecoration: "underline" }}>
                                Ajukan di sini
                            </a>
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={
            <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                <Spinner size="xl" />
            </Box>
        }>
            <TrackingContent />
        </Suspense>
    );
}
