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
  Card,
  Heading,
  Icon,
  Spinner,
  Textarea
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiCheck, FiX, FiClipboard, FiClock, FiAlertCircle } from "react-icons/fi";
import Swal from "sweetalert2"; // Import SweetAlert2

// --- TIPE DATA ---
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
  updatedAt: string;
  user: { nama: string; email: string; unitKerja?: { nama: string; kode: string } };
  items: RequestItem[];
}

export default function AdminRequestPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Warna BPS
  const BPS_BLUE = "#005DA6";
  const BPS_GREEN = "#8CC63F";
  const BPS_ORANGE = "#F7931E";

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

  // --- LOGIC APPROVAL DENGAN SWEET ALERT ---
  const handleAction = async (request: Request, action: "approve" | "reject") => {
    if (processingId) return;

    // 1. Tampilkan Konfirmasi Sweet Alert
    const result = await Swal.fire({
      title: action === "approve" ? "Setujui Permintaan?" : "Tolak Permintaan?",
      text: action === "approve" 
        ? "Stok barang akan berkurang sesuai jumlah yang disetujui." 
        : "Permintaan ini akan ditandai sebagai ditolak.",
      icon: action === "approve" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: action === "approve" ? BPS_GREEN : "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: action === "approve" ? "Ya, Setujui" : "Ya, Tolak",
      cancelButtonText: "Batal",
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    // 2. Jika user yakin, jalankan proses API
    setProcessingId(request.id);

    try {
      const status = action === "approve" ? "APPROVED" : "REJECTED";
      const approvedItems = action === "approve"
        ? request.items.map((item) => ({
            id: item.id,
            barangId: item.barang.id,
            barangNama: item.barang.nama,
            jumlahDiminta: item.jumlahDiminta,
            jumlahDisetujui: item.jumlahDiminta, // Default: full approval
          }))
        : [];

      const res = await fetch("/api/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: request.id, status, approvedItems }),
      });

      if (res.ok) {
        // Sukses Alert
        Swal.fire({
            title: "Berhasil!",
            text: action === "approve" ? "Permintaan telah disetujui." : "Permintaan telah ditolak.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
        });
        fetchRequests();
      } else {
        const error = await res.json();
        toaster.create({ title: error.error || "Gagal memproses", type: "error" });
      }
    } catch (error) {
      toaster.create({ title: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const processedRequests = requests.filter((r) => r.status !== "PENDING");

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  // --- KOMPONEN KARTU REQUEST ---
  const RequestCard = ({ request, showActions = false }: { request: Request; showActions?: boolean }) => (
    <Card.Root bg="white" shadow="md" borderRadius="lg" borderLeft={showActions ? `4px solid ${BPS_ORANGE}` : "1px solid #E2E8F0"}>
      <Card.Body p={5}>
        <Flex justify="space-between" align="start" mb={4} wrap="wrap" gap={4}>
          <HStack align="start">
            <Avatar.Root size="md" bg={BPS_BLUE} color="white">
              <Avatar.Fallback>{request.user.nama.substring(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize="md" color="gray.800">{request.user.nama}</Text>
              <Text fontSize="sm" color="gray.500">{request.user.email}</Text>
              {request.user.unitKerja && (
                <Badge mt={1} colorPalette="blue" variant="solid">
                  {request.user.unitKerja.nama}
                </Badge>
              )}
            </VStack>
          </HStack>
          
          <VStack align="end" gap={1}>
             {request.status === "PENDING" && <Badge colorPalette="orange" size="lg"><FiClock style={{marginRight:4}}/> Menunggu</Badge>}
             {request.status === "APPROVED" && <Badge colorPalette="green" size="lg"><FiCheck style={{marginRight:4}}/> Disetujui</Badge>}
             {request.status === "REJECTED" && <Badge colorPalette="red" size="lg"><FiX style={{marginRight:4}}/> Ditolak</Badge>}
             <Text fontSize="xs" color="gray.400" mt={1}>{formatDate(request.createdAt)}</Text>
          </VStack>
        </Flex>

        {/* Tabel Barang */}
        <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden" mb={4}>
          <Table.Root size="sm" striped>
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader color="gray.600">Barang</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right" color="gray.600">Diminta</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="right" color="gray.600">Stok Gudang</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {request.items.map((item) => {
                 const isStokAman = item.barang.stokTotal >= item.jumlahDiminta;
                 return (
                  <Table.Row key={item.id}>
                    <Table.Cell color="gray.800">{item.barang.nama}</Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="medium">{item.jumlahDiminta} {item.barang.satuan}</Table.Cell>
                    <Table.Cell textAlign="right">
                        <Badge 
                           variant="subtle" 
                           colorPalette={isStokAman ? "green" : "red"}
                        >
                           {item.barang.stokTotal} {item.barang.satuan}
                        </Badge>
                    </Table.Cell>
                  </Table.Row>
                 )
              })}
            </Table.Body>
          </Table.Root>
        </Box>

        {/* Catatan User */}
        {request.catatan && (
            <Box bg="gray.50" p={3} borderRadius="md" mb={4} borderLeft="3px solid gray">
                <Text fontSize="xs" fontWeight="bold" color="gray.500">Catatan Pemohon:</Text>
                <Text fontSize="sm" color="gray.700" fontStyle="italic">"{request.catatan}"</Text>
            </Box>
        )}

        {/* Tombol Aksi */}
        {showActions && (
          <HStack justify="flex-end" pt={2} borderTop="1px dashed" borderColor="gray.200">
            <Button
              variant="outline"
              colorPalette="red"
              size="sm"
              onClick={() => handleAction(request, "reject")}
              disabled={!!processingId}
            >
              <FiX style={{ marginRight: "6px" }} /> Tolak
            </Button>
            <Button
              bg={BPS_BLUE}
              color="white"
              size="sm"
              _hover={{ bg: "#00457C" }}
              onClick={() => handleAction(request, "approve")}
              disabled={!!processingId}
            >
              <FiCheck style={{ marginRight: "6px" }} /> Setujui Permintaan
            </Button>
          </HStack>
        )}
      </Card.Body>
    </Card.Root>
  );

  return (
    <Box>
      <Box mb={6}>
         <Heading size="xl" color="gray.800" mb={2}>Persetujuan Permintaan</Heading>
         <Text color="gray.500">Validasi pengajuan barang dari unit kerja.</Text>
      </Box>

      <Tabs.Root defaultValue="pending" variant="line">
        <Tabs.List bg="white" p={1} borderRadius="md" borderBottom="1px solid" borderColor="gray.200" mb={6}>
          <Tabs.Trigger value="pending" _selected={{ color: BPS_BLUE, borderColor: BPS_BLUE, fontWeight: "bold" }}>
             <FiClock style={{ marginRight: 6 }} /> 
             Menunggu Persetujuan
             {pendingRequests.length > 0 && (
                <Badge ml={2} bg="red.500" color="white" borderRadius="full" px={2}>{pendingRequests.length}</Badge>
             )}
          </Tabs.Trigger>
          <Tabs.Trigger value="history" _selected={{ color: BPS_BLUE, borderColor: BPS_BLUE, fontWeight: "bold" }}>
             <FiClipboard style={{ marginRight: 6 }} /> Riwayat Proses
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="pending">
          <VStack gap={4} align="stretch">
            {loading ? (
               <Flex justify="center" p={10}><Spinner size="xl" color={BPS_BLUE} /></Flex>
            ) : pendingRequests.length === 0 ? (
               <Flex direction="column" align="center" justify="center" bg="white" p={10} borderRadius="lg" border="1px dashed" borderColor="gray.300">
                  <Icon as={FiCheck} boxSize={10} color="green.500" mb={4} />
                  <Text color="gray.500" fontWeight="medium">Semua permintaan telah diproses.</Text>
               </Flex>
            ) : (
               pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} showActions />
               ))
            )}
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="history">
          <VStack gap={4} align="stretch">
             {processedRequests.length === 0 ? (
                <Flex justify="center" p={10} color="gray.500">Belum ada riwayat.</Flex>
             ) : (
                processedRequests.map((request) => (
                   <RequestCard key={request.id} request={request} />
                ))
             )}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}