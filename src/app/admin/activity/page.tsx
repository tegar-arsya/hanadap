"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    Badge,
    NativeSelect,
    Button,
    Flex,
} from "@chakra-ui/react";
import { FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface ActivityLog {
    id: string;
    action: string;
    entity: string;
    description: string;
    createdAt: string;
    user: { nama: string };
}

const ACTION_COLORS: Record<string, string> = {
    LOGIN: "blue",
    CREATE: "green",
    UPDATE: "orange",
    DELETE: "red",
    APPROVE: "teal",
    REJECT: "pink",
    RETURN: "purple",
};

const ENTITIES = ["User", "Barang", "Request", "StockBatch", "Kategori", "UnitKerja"];

export default function AdminActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString() });
        if (entityFilter) params.set("entity", entityFilter);
        const res = await fetch(`/api/activity-log?${params}`);
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setLoading(false);
    };

    useEffect(() => { fetchLogs(); }, [page, entityFilter]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Activity Log</Heading>
                <Text color="gray.500">Riwayat aktivitas pengguna sistem</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Body>
                    <NativeSelect.Root maxW="250px">
                        <NativeSelect.Field
                            value={entityFilter}
                            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">Semua Entity</option>
                            {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </Card.Body>
            </Card.Root>

            {logs.length === 0 && !loading ? (
                <Card.Root><Card.Body textAlign="center" py={10}><Text color="gray.500">Belum ada aktivitas</Text></Card.Body></Card.Root>
            ) : (
                <VStack gap={3} align="stretch">
                    {logs.map((log) => (
                        <Card.Root key={log.id}>
                            <Card.Body py={3}>
                                <HStack gap={4}>
                                    <Badge colorPalette={ACTION_COLORS[log.action] || "gray"} fontSize="xs">
                                        {log.action}
                                    </Badge>
                                    <VStack align="start" gap={0} flex={1}>
                                        <Text fontSize="sm">{log.description}</Text>
                                        <HStack fontSize="xs" color="gray.500">
                                            <Text fontWeight="medium">{log.user.nama}</Text>
                                            <Text>•</Text>
                                            <Badge size="sm" variant="subtle">{log.entity}</Badge>
                                            <Text>•</Text>
                                            <Text>{formatDate(log.createdAt)}</Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </VStack>
            )}

            {totalPages > 1 && (
                <Flex justify="center" mt={6} gap={4} align="center">
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <FiChevronLeft />
                        Sebelumnya
                    </Button>
                    <Text fontSize="sm" color="gray.500">Halaman {page} dari {totalPages}</Text>
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Selanjutnya
                        <FiChevronRight />
                    </Button>
                </Flex>
            )}
        </Box>
    );
}
