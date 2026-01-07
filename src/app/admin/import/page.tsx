"use client";

import { useState, useRef } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    Button,
    Input,
    Alert,
    Progress,
    Badge,
    Table,
} from "@chakra-ui/react";
import { FiUpload, FiDownload, FiCheck, FiX } from "react-icons/fi";

export default function AdminImportPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        success?: number;
        failed?: number;
        message?: string;
        errors?: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/import", { method: "POST", body: formData });
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ message: "Gagal mengupload file" });
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const downloadTemplate = () => {
        const template = "nama,satuan,stokMinimum,kategori,barcode\nKertas A4,rim,20,ATK,1234567890\nPulpen,pcs,50,ATK,\nTinta Printer,botol,5,Elektronik,";
        const blob = new Blob([template], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_barang.csv";
        a.click();
    };

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Import Data</Heading>
                <Text color="gray.500">Upload file Excel/CSV untuk import barang</Text>
            </VStack>

            <Card.Root mb={6}>
                <Card.Body>
                    <Text fontWeight="semibold" mb={4}>Format File</Text>
                    <Table.Root size="sm" variant="outline">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Kolom</Table.ColumnHeader>
                                <Table.ColumnHeader>Wajib</Table.ColumnHeader>
                                <Table.ColumnHeader>Keterangan</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row><Table.Cell><code>nama</code></Table.Cell><Table.Cell><FiCheck color="green" /></Table.Cell><Table.Cell>Nama barang</Table.Cell></Table.Row>
                            <Table.Row><Table.Cell><code>satuan</code></Table.Cell><Table.Cell><FiCheck color="green" /></Table.Cell><Table.Cell>Satuan (pcs, rim, dll)</Table.Cell></Table.Row>
                            <Table.Row><Table.Cell><code>stokMinimum</code></Table.Cell><Table.Cell><FiX color="gray" /></Table.Cell><Table.Cell>Stok minimum (default: 10)</Table.Cell></Table.Row>
                            <Table.Row><Table.Cell><code>kategori</code></Table.Cell><Table.Cell><FiX color="gray" /></Table.Cell><Table.Cell>Nama kategori</Table.Cell></Table.Row>
                            <Table.Row><Table.Cell><code>barcode</code></Table.Cell><Table.Cell><FiX color="gray" /></Table.Cell><Table.Cell>Barcode/QR</Table.Cell></Table.Row>
                        </Table.Body>
                    </Table.Root>
                    <Button mt={4} colorPalette="blue" variant="outline" onClick={downloadTemplate}>
                        <FiDownload />
                        Download Template CSV
                    </Button>
                </Card.Body>
            </Card.Root>

            <Card.Root mb={6}>
                <Card.Body>
                    <Text fontWeight="semibold" mb={4}>Upload File</Text>
                    <Box
                        position="relative"
                        border="2px dashed"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={10}
                        textAlign="center"
                        _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                        transition="all 0.2s"
                    >
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            position="absolute"
                            inset={0}
                            opacity={0}
                            cursor="pointer"
                            h="full"
                        />
                        <VStack>
                            <Box color="gray.400">
                                <FiUpload size={32} />
                            </Box>
                            <Text>{loading ? "Memproses..." : "Klik atau drag file ke sini"}</Text>
                            <Text fontSize="sm" color="gray.500">Excel (.xlsx, .xls) atau CSV</Text>
                        </VStack>
                        {loading && <Progress.Root size="xs" mt={4}><Progress.Track><Progress.Range /></Progress.Track></Progress.Root>}
                    </Box>
                </Card.Body>
            </Card.Root>

            {result && (
                <Alert.Root status={result.failed === 0 ? "success" : "warning"} borderRadius="lg">
                    <Alert.Indicator />
                    <Alert.Content>
                        <VStack align="start" gap={2} flex={1}>
                            <Text fontWeight="semibold">{result.message}</Text>
                            <HStack>
                                <Badge colorPalette="green">{result.success} berhasil</Badge>
                                {result.failed !== undefined && result.failed > 0 && (
                                    <Badge colorPalette="red">{result.failed} gagal</Badge>
                                )}
                            </HStack>
                        </VStack>
                    </Alert.Content>
                </Alert.Root>
            )}
        </Box>
    );
}
