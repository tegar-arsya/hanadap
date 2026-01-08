"use client";

import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Badge,
    NativeSelect,
    Button,
    Flex,
    Text,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiInbox } from "react-icons/fi";
import { PageHeader, Card, EmptyStateBox } from "@/components/ui/shared";

interface ActivityLog {
    id: string;
    action: string;
    entity: string;
    description: string;
    createdAt: string;
    user: { nama: string };
}

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
    LOGIN: { bg: "var(--stat-blue-bg)", color: "var(--stat-blue-color)" },
    CREATE: { bg: "var(--stat-green-bg)", color: "var(--stat-green-color)" },
    UPDATE: { bg: "var(--stat-orange-bg)", color: "var(--stat-orange-color)" },
    DELETE: { bg: "var(--stat-red-bg)", color: "var(--stat-red-color)" },
    APPROVE: { bg: "var(--stat-green-bg)", color: "var(--stat-green-color)" },
    REJECT: { bg: "var(--stat-red-bg)", color: "var(--stat-red-color)" },
    RETURN: { bg: "var(--stat-purple-bg)", color: "var(--stat-purple-color)" },
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

    const actionStyle = (action: string) => ACTION_COLORS[action] || { bg: "var(--card-bg)", color: "var(--foreground)" };

    return (
        <Box>
            <PageHeader title="Activity Log" description="Riwayat aktivitas pengguna sistem" />

            <Box mb="1.5rem">
                <Card>
                    <NativeSelect.Root maxW="250px">
                        <NativeSelect.Field
                            value={entityFilter}
                            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                            style={{
                                background: "var(--input-bg)",
                                borderColor: "var(--input-border)",
                                color: "var(--foreground)",
                            }}
                        >
                            <option value="" style={{ background: "var(--card-bg)" }}>Semua Entity</option>
                            {ENTITIES.map((e) => <option key={e} value={e} style={{ background: "var(--card-bg)" }}>{e}</option>)}
                        </NativeSelect.Field>
                    </NativeSelect.Root>
                </Card>
            </Box>

            {logs.length === 0 && !loading ? (
                <Box>
                    <EmptyStateBox
                        title="Belum ada aktivitas"
                        description="Tidak ada data aktivitas yang tersedia."
                    />
                </Box>
            ) : (
                <VStack gap={3} align="stretch">
                    {logs.map((log) => (
                        <Card key={log.id}>
                            <HStack gap={4}>
                                <Box
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                    style={{
                                        background: actionStyle(log.action).bg,
                                        color: actionStyle(log.action).color,
                                    }}
                                >
                                    {log.action}
                                </Box>
                                <VStack align="start" gap={0} flex={1}>
                                    <Text fontSize="sm" style={{ color: "var(--foreground)" }}>{log.description}</Text>
                                    <HStack fontSize="xs" style={{ color: "var(--muted-foreground)" }}>
                                        <Text fontWeight="medium">{log.user.nama}</Text>
                                        <Text>•</Text>
                                        <Badge
                                            size="sm"
                                            variant="subtle"
                                            style={{
                                                background: "var(--input-bg)",
                                                color: "var(--foreground)",
                                            }}
                                        >
                                            {log.entity}
                                        </Badge>
                                        <Text>•</Text>
                                        <Text>{formatDate(log.createdAt)}</Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Card>
                    ))}
                </VStack>
            )}

            {totalPages > 1 && (
                <Flex justify="center" mt={6} gap={4} align="center">
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            background: "var(--input-bg)",
                            color: "var(--foreground)",
                            borderColor: "var(--input-border)",
                        }}
                    >
                        <FiChevronLeft />
                        Sebelumnya
                    </Button>
                    <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>
                        Halaman {page} dari {totalPages}
                    </Text>
                    <Button
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            background: "var(--input-bg)",
                            color: "var(--foreground)",
                            borderColor: "var(--input-border)",
                        }}
                    >
                        Selanjutnya
                        <FiChevronRight />
                    </Button>
                </Flex>
            )}
        </Box>
    );
}
