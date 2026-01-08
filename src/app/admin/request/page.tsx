"use client";

import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Button,
    Badge,
    Table,
    Tabs,
    Avatar,
    Flex,
    Text,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCheck, FiX, FiClipboard } from "react-icons/fi";
import { PageHeader, Card, StatusBadge, LoadingCard, EmptyCard } from "@/components/ui/shared";

interface RequestItem {
    id: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: { id: string; nama: string; satuan: string; stokTotal: number };
}

interface Request {
    id: string;
    status: string;
    catatan: string | null;
    createdAt: string;
    user: { nama: string; email: string };
    items: RequestItem[];
}

export default function AdminRequestPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const showToast = (title: string, type: "success" | "error" | "info") => {
        toaster.create({
            title,
            type,
        });
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/request");
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (request: Request, action: "approve" | "reject") => {
        if (processingId) return; // prevent double submit across requests
        setProcessingId(request.id);

        try {
            const status = action === "approve" ? "APPROVED" : "REJECTED";
            const approvedItems = action === "approve"
                ? request.items.map((item) => ({
                    id: item.id,
                    barangId: item.barang.id,
                    barangNama: item.barang.nama,
                    jumlahDiminta: item.jumlahDiminta,
                    jumlahDisetujui: item.jumlahDiminta, // Default: setujui semua
                }))
                : [];

            const res = await fetch("/api/request", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: request.id, status, approvedItems }),
            });

            if (res.ok) {
                showToast(
                    action === "approve" ? "Request disetujui" : "Request ditolak",
                    action === "approve" ? "success" : "info"
                );
                fetchRequests();
            } else {
                const error = await res.json();
                showToast(error.error || "Gagal memproses request", "error");
            }
        } catch (error) {
            showToast("Gagal memproses request", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingRequests = requests.filter((r) => r.status === "PENDING");
    const processedRequests = requests.filter((r) => r.status !== "PENDING");

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const RequestCard = ({ request, showActions = false }: { request: Request; showActions?: boolean }) => (
        <Card>
            <Flex justify="space-between" align="center" mb={4}>
                <HStack>
                    <Avatar.Root size="sm" colorPalette="blue">
                        <Avatar.Fallback>{request.user.nama.substring(0, 2).toUpperCase()}</Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" gap={0}>
                        <Text fontWeight="semibold" color="var(--foreground)">{request.user.nama}</Text>
                        <Text fontSize="xs" color="var(--sidebar-text-muted)">{formatDate(request.createdAt)}</Text>
                    </VStack>
                </HStack>
                <StatusBadge
                    status={request.status}
                    colorScheme={
                        request.status === "PENDING"
                            ? "orange"
                            : request.status === "APPROVED"
                                ? "green"
                                : "red"
                    }
                />
            </Flex>

            <Box overflowX="auto" mx={-5} borderTop="1px solid" borderColor="var(--card-border)">
                <Table.Root size="sm">
                    <Table.Header>
                        <Table.Row bg="var(--table-header-bg)">
                            <Table.ColumnHeader px={5} py={2} color="var(--sidebar-text-muted)" fontSize="xs">Barang</Table.ColumnHeader>
                            <Table.ColumnHeader px={5} py={2} color="var(--sidebar-text-muted)" fontSize="xs" textAlign="right">Diminta</Table.ColumnHeader>
                            <Table.ColumnHeader px={5} py={2} color="var(--sidebar-text-muted)" fontSize="xs" textAlign="right">Stok</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {request.items.map((item) => (
                            <Table.Row key={item.id}>
                                <Table.Cell px={5} py={2} color="var(--foreground)">{item.barang.nama}</Table.Cell>
                                <Table.Cell px={5} py={2} textAlign="right" color="var(--foreground)">{item.jumlahDiminta} {item.barang.satuan}</Table.Cell>
                                <Table.Cell px={5} py={2} textAlign="right" color={item.barang.stokTotal >= item.jumlahDiminta ? "var(--stat-green-color)" : "var(--stat-red-color)"}>
                                    {item.barang.stokTotal}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            {request.catatan && (
                <Text fontSize="sm" color="var(--sidebar-text-muted)" mt={3} px={0}>
                    Catatan: {request.catatan}
                </Text>
            )}

            {showActions && (
                <HStack mt={4} justify="flex-end">
                    <Button
                        colorPalette="red"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(request, "reject")}
                        disabled={processingId === request.id}
                        loading={processingId === request.id}
                        loadingText="Memproses..."
                        spinnerPlacement="start"
                    >
                        <FiX />
                        Tolak
                    </Button>
                    <Button
                        colorPalette="green"
                        size="sm"
                        onClick={() => handleAction(request, "approve")}
                        disabled={processingId === request.id}
                        loading={processingId === request.id}
                        loadingText="Memproses..."
                        spinnerPlacement="start"
                    >
                        <FiCheck />
                        Setujui
                    </Button>
                </HStack>
            )}
        </Card>
    );

    return (
        <>
            <PageHeader
                title="Permintaan Barang"
                description="Kelola permintaan dari unit kerja"
            />

            <Tabs.Root defaultValue="pending" colorPalette="blue">
                <Tabs.List bg="var(--card-bg)" borderRadius="lg" p={1} mb={4}>
                    <Tabs.Trigger value="pending" borderRadius="md" color="var(--sidebar-text-muted)" _selected={{ bg: "var(--active-bg-admin)", color: "var(--active-color-admin)" }}>
                        Pending
                        {pendingRequests.length > 0 && (
                            <Badge ml={2} colorPalette="orange">{pendingRequests.length}</Badge>
                        )}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="history" borderRadius="md" color="var(--sidebar-text-muted)" _selected={{ bg: "var(--active-bg-admin)", color: "var(--active-color-admin)" }}>
                        Riwayat
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="pending" px={0}>
                    <VStack gap={4} align="stretch">
                        {loading ? (
                            <LoadingCard message="Memuat permintaan..." />
                        ) : pendingRequests.length === 0 ? (
                            <EmptyCard
                                icon={<FiClipboard size={48} />}
                                message="Tidak ada permintaan pending"
                                description="Semua permintaan telah diproses"
                            />
                        ) : (
                            pendingRequests.map((request) => (
                                <RequestCard key={request.id} request={request} showActions />
                            ))
                        )}
                    </VStack>
                </Tabs.Content>

                <Tabs.Content value="history" px={0}>
                    <VStack gap={4} align="stretch">
                        {processedRequests.length === 0 ? (
                            <EmptyCard
                                icon={<FiClipboard size={48} />}
                                message="Belum ada riwayat"
                                description="Riwayat permintaan akan muncul di sini"
                            />
                        ) : (
                            processedRequests.map((request) => (
                                <RequestCard key={request.id} request={request} />
                            ))
                        )}
                    </VStack>
                </Tabs.Content>
            </Tabs.Root>
        </>
    );
}
