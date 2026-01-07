"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Table,
    Separator,
} from "@chakra-ui/react";
import { FiClock, FiCheck, FiX } from "react-icons/fi";
import { PageHeader, Card, EmptyStateBox, StatusBadge } from "@/components/ui/shared";

interface RequestItem {
    id: string;
    jumlahDiminta: number;
    jumlahDisetujui: number;
    barang: { nama: string; satuan: string };
}

interface Request {
    id: string;
    status: string;
    catatan: string | null;
    createdAt: string;
    items: RequestItem[];
}

export default function UnitKerjaTrackingPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/request")
            .then((res) => res.json())
            .then((data) => setRequests(data))
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "PENDING":
                return <FiClock style={{ color: "var(--stat-orange-color)" }} />;
            case "APPROVED":
                return <FiCheck style={{ color: "var(--stat-green-color)" }} />;
            case "REJECTED":
                return <FiX style={{ color: "var(--stat-red-color)" }} />;
            default:
                return <FiClock style={{ color: "var(--muted-foreground)" }} />;
        }
    };

    return (
        <Box>
            <PageHeader title="Tracking Permintaan" subtitle="Pantau status permintaan Anda" />

            {requests.length === 0 && !loading ? (
                <EmptyStateBox message="Belum ada permintaan" />
            ) : (
                <VStack gap={4} align="stretch">
                    {requests.map((request) => (
                        <Card key={request.id}>
                            <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                                <HStack>
                                    {getStatusIcon(request.status)}
                                    <Text fontWeight="semibold" style={{ color: "var(--foreground)" }}>
                                        Request #{request.id.slice(-6)}
                                    </Text>
                                </HStack>
                                <HStack>
                                    <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>
                                        {formatDate(request.createdAt)}
                                    </Text>
                                    <StatusBadge status={request.status} />
                                </HStack>
                            </HStack>

                            <Box overflowX="auto">
                                <Table.Root size="sm">
                                    <Table.Header>
                                        <Table.Row style={{ background: "var(--table-header-bg)" }}>
                                            <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Barang</Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign="right" style={{ color: "var(--foreground)" }}>Diminta</Table.ColumnHeader>
                                            <Table.ColumnHeader textAlign="right" style={{ color: "var(--foreground)" }}>Disetujui</Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {request.items.map((item) => (
                                            <Table.Row key={item.id} style={{ borderColor: "var(--card-border)" }}>
                                                <Table.Cell style={{ color: "var(--foreground)" }}>{item.barang.nama}</Table.Cell>
                                                <Table.Cell textAlign="right" style={{ color: "var(--foreground)" }}>
                                                    {item.jumlahDiminta} {item.barang.satuan}
                                                </Table.Cell>
                                                <Table.Cell
                                                    textAlign="right"
                                                    style={{
                                                        color: item.jumlahDisetujui > 0
                                                            ? "var(--stat-green-color)"
                                                            : "var(--muted-foreground)",
                                                    }}
                                                >
                                                    {item.jumlahDisetujui > 0 ? `${item.jumlahDisetujui} ${item.barang.satuan}` : "-"}
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </Box>

                            {request.catatan && (
                                <>
                                    <Separator my={3} style={{ borderColor: "var(--card-border)" }} />
                                    <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>
                                        Catatan: {request.catatan}
                                    </Text>
                                </>
                            )}
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
}
