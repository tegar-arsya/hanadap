"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    CardHeader,
    Badge,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Divider,
    Icon,
} from "@chakra-ui/react";
import { FiClock, FiCheck, FiX } from "react-icons/fi";

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
                return FiClock;
            case "APPROVED":
                return FiCheck;
            case "REJECTED":
                return FiX;
            default:
                return FiClock;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "orange";
            case "APPROVED":
                return "green";
            case "REJECTED":
                return "red";
            default:
                return "gray";
        }
    };

    return (
        <Box>
            <VStack align="start" spacing={1} mb={8}>
                <Heading size="lg">Tracking Permintaan</Heading>
                <Text color="gray.500">Pantau status permintaan Anda</Text>
            </VStack>

            {requests.length === 0 && !loading ? (
                <Card>
                    <CardBody textAlign="center" py={10}>
                        <Text color="gray.500">Belum ada permintaan</Text>
                    </CardBody>
                </Card>
            ) : (
                <VStack spacing={4} align="stretch">
                    {requests.map((request) => (
                        <Card key={request.id}>
                            <CardHeader pb={2}>
                                <HStack justify="space-between">
                                    <HStack>
                                        <Icon
                                            as={getStatusIcon(request.status)}
                                            color={`${getStatusColor(request.status)}.500`}
                                        />
                                        <Text fontWeight="semibold">Request #{request.id.slice(-6)}</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontSize="sm" color="gray.500">
                                            {formatDate(request.createdAt)}
                                        </Text>
                                        <Badge colorScheme={getStatusColor(request.status)}>
                                            {request.status}
                                        </Badge>
                                    </HStack>
                                </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                                <Table size="sm" variant="simple">
                                    <Thead>
                                        <Tr>
                                            <Th>Barang</Th>
                                            <Th isNumeric>Diminta</Th>
                                            <Th isNumeric>Disetujui</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {request.items.map((item) => (
                                            <Tr key={item.id}>
                                                <Td>{item.barang.nama}</Td>
                                                <Td isNumeric>{item.jumlahDiminta} {item.barang.satuan}</Td>
                                                <Td isNumeric color={item.jumlahDisetujui > 0 ? "green.500" : "gray.400"}>
                                                    {item.jumlahDisetujui > 0 ? `${item.jumlahDisetujui} ${item.barang.satuan}` : "-"}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>

                                {request.catatan && (
                                    <>
                                        <Divider my={3} />
                                        <Text fontSize="sm" color="gray.500">
                                            Catatan: {request.catatan}
                                        </Text>
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
}
