"use client";

import { useState, useRef } from "react";
import {
    Box,
    Text,
    VStack,
    HStack,
    Button,
    Input,
    Alert,
    Progress,
    Badge,
    Table,
} from "@chakra-ui/react";
import { FiUpload, FiDownload, FiCheck, FiX } from "react-icons/fi";
import { PageHeader, Card } from "@/components/ui/shared";

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
        const template = "nama,satuan,stokMinimum,kategori\nKertas A4,rim,20,ATK\nPulpen,pcs,50,ATK\nTinta Printer,botol,5,Elektronik";
        const blob = new Blob([template], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "template_import_barang.csv";
        a.click();
    };

    return (
        <Box>
            <PageHeader title="Import Data" subtitle="Upload file Excel/CSV untuk import barang" />

            <Card style={{ marginBottom: "1.5rem" }}>
                <Text fontWeight="semibold" mb={4} style={{ color: "var(--foreground)" }}>Format File</Text>
                <Box overflowX="auto">
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row style={{ background: "var(--table-header-bg)" }}>
                                <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Kolom</Table.ColumnHeader>
                                <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Wajib</Table.ColumnHeader>
                                <Table.ColumnHeader style={{ color: "var(--foreground)" }}>Keterangan</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            <Table.Row style={{ borderColor: "var(--card-border)" }}>
                                <Table.Cell><code style={{ color: "var(--stat-blue-color)" }}>nama</code></Table.Cell>
                                <Table.Cell><FiCheck color="var(--stat-green-color)" /></Table.Cell>
                                <Table.Cell style={{ color: "var(--foreground)" }}>Nama barang</Table.Cell>
                            </Table.Row>
                            <Table.Row style={{ borderColor: "var(--card-border)" }}>
                                <Table.Cell><code style={{ color: "var(--stat-blue-color)" }}>satuan</code></Table.Cell>
                                <Table.Cell><FiCheck color="var(--stat-green-color)" /></Table.Cell>
                                <Table.Cell style={{ color: "var(--foreground)" }}>Satuan (pcs, rim, dll)</Table.Cell>
                            </Table.Row>
                            <Table.Row style={{ borderColor: "var(--card-border)" }}>
                                <Table.Cell><code style={{ color: "var(--stat-blue-color)" }}>stokMinimum</code></Table.Cell>
                                <Table.Cell><FiX color="var(--muted-foreground)" /></Table.Cell>
                                <Table.Cell style={{ color: "var(--foreground)" }}>Stok minimum (default: 10)</Table.Cell>
                            </Table.Row>
                            <Table.Row style={{ borderColor: "var(--card-border)" }}>
                                <Table.Cell><code style={{ color: "var(--stat-blue-color)" }}>kategori</code></Table.Cell>
                                <Table.Cell><FiX color="var(--muted-foreground)" /></Table.Cell>
                                <Table.Cell style={{ color: "var(--foreground)" }}>Nama kategori</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table.Root>
                </Box>
                <Button
                    mt={4}
                    variant="outline"
                    onClick={downloadTemplate}
                    style={{
                        borderColor: "var(--stat-blue-color)",
                        color: "var(--stat-blue-color)",
                    }}
                >
                    <FiDownload />
                    Download Template CSV
                </Button>
            </Card>

            <Card style={{ marginBottom: "1.5rem" }}>
                <Text fontWeight="semibold" mb={4} style={{ color: "var(--foreground)" }}>Upload File</Text>
                <Box
                    position="relative"
                    borderRadius="lg"
                    p={10}
                    textAlign="center"
                    transition="all 0.2s"
                    style={{
                        border: "2px dashed var(--input-border)",
                        background: "var(--input-bg)",
                    }}
                    _hover={{
                        borderColor: "var(--stat-blue-color)",
                    }}
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
                        <Box style={{ color: "var(--muted-foreground)" }}>
                            <FiUpload size={32} />
                        </Box>
                        <Text style={{ color: "var(--foreground)" }}>
                            {loading ? "Memproses..." : "Klik atau drag file ke sini"}
                        </Text>
                        <Text fontSize="sm" style={{ color: "var(--muted-foreground)" }}>
                            Excel (.xlsx, .xls) atau CSV
                        </Text>
                    </VStack>
                    {loading && (
                        <Progress.Root size="xs" mt={4}>
                            <Progress.Track style={{ background: "var(--input-bg)" }}>
                                <Progress.Range style={{ background: "var(--stat-blue-color)" }} />
                            </Progress.Track>
                        </Progress.Root>
                    )}
                </Box>
            </Card>

            {result && (
                <Alert.Root
                    status={result.failed === 0 ? "success" : "warning"}
                    borderRadius="lg"
                    style={{
                        background: result.failed === 0 ? "var(--stat-green-bg)" : "var(--stat-orange-bg)",
                    }}
                >
                    <Alert.Indicator />
                    <Alert.Content>
                        <VStack align="start" gap={2} flex={1}>
                            <Text fontWeight="semibold" style={{ color: "var(--foreground)" }}>{result.message}</Text>
                            <HStack>
                                <Badge style={{ background: "var(--stat-green-bg)", color: "var(--stat-green-color)" }}>
                                    {result.success} berhasil
                                </Badge>
                                {result.failed !== undefined && result.failed > 0 && (
                                    <Badge style={{ background: "var(--stat-red-bg)", color: "var(--stat-red-color)" }}>
                                        {result.failed} gagal
                                    </Badge>
                                )}
                            </HStack>
                        </VStack>
                    </Alert.Content>
                </Alert.Root>
            )}
        </Box>
    );
}
