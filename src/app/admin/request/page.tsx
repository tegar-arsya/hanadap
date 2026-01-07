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
    Badge,
    Separator,
    Table,
    Tabs,
    Avatar,
    Flex,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCheck, FiX } from "react-icons/fi";

interface RequestItem {
    id: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: { nama: string; satuan: string; stokTotal: number };
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

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const res = await fetch("/api/request", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId: id, action }),
            });

            if (res.ok) {
                showToast(
                    action === "approve" ? "Request disetujui" : "Request ditolak",
                    action === "approve" ? "success" : "info"
                );
                fetchRequests();
            }
        } catch (error) {
            showToast("Gagal memproses request", "error");
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
        <Card.Root mb={4}>
            <Card.Header pb={2}>
                <Flex justify="space-between" align="center">
                    <HStack>
                        <Avatar.Root size="sm">
                            <Avatar.Fallback>{request.user.nama.substring(0, 2).toUpperCase()}</Avatar.Fallback>
                        </Avatar.Root>
                        <VStack align="start" gap={0}>
                            <Text fontWeight="semibold">{request.user.nama}</Text>
                            <Text fontSize="xs" color="gray.500">{formatDate(request.createdAt)}</Text>
                        </VStack>
                    </HStack>
                    <Badge
                        colorPalette={
                            request.status === "PENDING"
                                ? "orange"
                                : request.status === "APPROVED"
                                    ? "green"
                                    : "red"
                        }
                    >
                        {request.status}
                    </Badge>
                </Flex>
            </Card.Header>
            <Card.Body pt={2}>
                <Table.Root size="sm" variant="outline">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Barang</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="right">Diminta</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="right">Stok</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {request.items.map((item) => (
                            <Table.Row key={item.id}>
                                <Table.Cell>{item.barang.nama}</Table.Cell>
                                <Table.Cell textAlign="right">{item.jumlahDiminta} {item.barang.satuan}</Table.Cell>
                                <Table.Cell textAlign="right" color={item.barang.stokTotal >= item.jumlahDiminta ? "green.500" : "red.500"}>
                                    {item.barang.stokTotal}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>

                {request.catatan && (
                    <Text fontSize="sm" color="gray.500" mt={3}>
                        Catatan: {request.catatan}
                    </Text>
                )}

                {showActions && (
                    <HStack mt={4} justify="flex-end">
                        <Button
                            colorPalette="red"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(request.id, "reject")}
                        >
                            <FiX />
                            Tolak
                        </Button>
                        <Button
                            colorPalette="green"
                            size="sm"
                            onClick={() => handleAction(request.id, "approve")}
                        >
                            <FiCheck />
                            Setujui
                        </Button>
                    </HStack>
                )}
            </Card.Body>
        </Card.Root>
    );

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Permintaan Barang</Heading>
                <Text color="gray.500">Kelola permintaan dari unit kerja</Text>
            </VStack>

            <Tabs.Root defaultValue="pending" colorPalette="blue">
                <Tabs.List>
                    <Tabs.Trigger value="pending">
                        Pending
                        {pendingRequests.length > 0 && (
                            <Badge ml={2} colorPalette="orange">{pendingRequests.length}</Badge>
                        )}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="history">Riwayat</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="pending" px={0}>
                    {pendingRequests.length === 0 ? (
                        <Card.Root>
                            <Card.Body textAlign="center" py={10}>
                                <Text color="gray.500">Tidak ada permintaan pending</Text>
                            </Card.Body>
                        </Card.Root>
                    ) : (
                        pendingRequests.map((request) => (
                            <RequestCard key={request.id} request={request} showActions />
                        ))
                    )}
                </Tabs.Content>

                <Tabs.Content value="history" px={0}>
                    {processedRequests.length === 0 ? (
                        <Card.Root>
                            <Card.Body textAlign="center" py={10}>
                                <Text color="gray.500">Belum ada riwayat</Text>
                            </Card.Body>
                        </Card.Root>
                    ) : (
                        processedRequests.map((request) => (
                            <RequestCard key={request.id} request={request} />
                        ))
                    )}
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}
