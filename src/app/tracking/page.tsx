"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
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
  Tabs,
  Card,
  Icon,
  Separator,
  Flex,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { 
  FiSearch, 
  FiPackage, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiArrowLeft, 
  FiHash, 
  FiMail,
  FiUser,
  FiCalendar
} from "react-icons/fi";

// --- KONFIGURASI WARNA BPS ---
const BPS = {
  blue: "#005DA6",
  darkBlue: "#00457C",
  orange: "#F7931E",
  green: "#8CC63F",
  grayBg: "#F4F7FE",
  border: "#E2E8F0",
};

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

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setRequestId(id);
      handleSearchById(id);
    }
  }, [searchParams]);

  const handleSearchById = async (id: string) => {
    if (!id) {
      showToast("Mohon masukkan ID permintaan", "info");
      return;
    }
    executeSearch(`/api/request/tracking?id=${id}`);
  };

  const handleSearchByEmail = async () => {
    if (!email) {
      showToast("Mohon masukkan alamat email", "info");
      return;
    }
    executeSearch(`/api/request/tracking?email=${encodeURIComponent(email)}`);
  };

  const executeSearch = async (url: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Handle response jika single object atau array
        setRequests(Array.isArray(data) ? data : (data ? [data] : []));
      } else {
        setRequests([]);
      }
    } catch (error) {
      showToast("Gagal melakukan pencarian", "error");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return BPS.green;
      case "REJECTED": return "red.500";
      default: return BPS.orange;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge colorPalette="orange" variant="solid" size="lg"><FiClock style={{marginRight:4}}/> Menunggu Verifikasi</Badge>;
      case "APPROVED":
        return <Badge colorPalette="green" variant="solid" size="lg"><FiCheckCircle style={{marginRight:4}}/> Disetujui</Badge>;
      case "REJECTED":
        return <Badge colorPalette="red" variant="solid" size="lg"><FiXCircle style={{marginRight:4}}/> Ditolak</Badge>;
      default:
        return <Badge size="lg">{status}</Badge>;
    }
  };

  return (
    <Box minH="100vh" bg={BPS.grayBg} py={{ base: 6, md: 10 }}>
       {/* Dekorasi Header Background */}
       <Box 
        position="absolute" 
        top={0} left={0} right={0} 
        h="220px" 
        bg={BPS.blue} 
        zIndex={0} 
        borderBottomRadius={{ base: "none", md: "3xl" }}
      />

      <Container maxW="container.md" position="relative" zIndex={1}>
        <VStack gap={8} align="stretch">
          
          {/* HEADER SECTION */}
          <Flex direction="column" color="white">
            <Link href="/">
              <HStack color="whiteAlpha.800" _hover={{ color: "white" }} mb={4} cursor="pointer">
                <FiArrowLeft />
                <Text fontSize="sm">Kembali ke Beranda</Text>
              </HStack>
            </Link>
            <HStack justify="space-between" align="start">
               <Box>
                  <Heading size="2xl" fontWeight="bold">Lacak Permintaan</Heading>
                  <Text color="blue.100" mt={2}>
                    Pantau status persetujuan dan riwayat pengambilan barang Anda.
                  </Text>
               </Box>
               <Box bg="whiteAlpha.200" p={3} borderRadius="xl" display={{ base: "none", sm: "block" }}>
                  <FiSearch size={32} />
               </Box>
            </HStack>
          </Flex>

          {/* SEARCH CARD (TABS) */}
          <Box bg="white" borderRadius="xl" shadow="xl" overflow="hidden">
            <Tabs.Root defaultValue="id" variant="line" fitted>
              <Tabs.List bg="gray.50" p={1} borderBottom="1px solid" borderColor={BPS.border}>
                <Tabs.Trigger value="id" _selected={{ color: BPS.blue, borderColor: BPS.blue, fontWeight: "bold", bg: "white", shadow: "sm" }}>
                  <FiHash style={{ marginRight: 8 }} /> ID Permintaan
                </Tabs.Trigger>
                <Tabs.Trigger value="email" _selected={{ color: BPS.blue, borderColor: BPS.blue, fontWeight: "bold", bg: "white", shadow: "sm" }}>
                  <FiMail style={{ marginRight: 8 }} /> Email Pemohon
                </Tabs.Trigger>
              </Tabs.List>

              <Box p={6}>
                <Tabs.Content value="id">
                  <HStack gap={3}>
                    <Input
                      placeholder="Contoh: REQ-2024001"
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value)}
                      size="lg"
                      borderColor={BPS.border}
                      _focus={{ borderColor: BPS.blue }}
                    />
                    <Button 
                      size="lg" 
                      bg={BPS.orange} 
                      color="white" 
                      onClick={() => handleSearchById(requestId)}
                      loading={loading}
                      _hover={{ bg: "#D87C10" }}
                      px={8}
                    >
                      Cari
                    </Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={2}>*Masukkan ID unik yang Anda dapatkan saat pengajuan.</Text>
                </Tabs.Content>

                <Tabs.Content value="email">
                  <HStack gap={3}>
                    <Input
                      placeholder="nama@bps.go.id"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      borderColor={BPS.border}
                      _focus={{ borderColor: BPS.blue }}
                    />
                    <Button 
                      size="lg" 
                      bg={BPS.orange} 
                      color="white" 
                      onClick={handleSearchByEmail}
                      loading={loading}
                      _hover={{ bg: "#D87C10" }}
                      px={8}
                    >
                      Cari
                    </Button>
                  </HStack>
                  <Text fontSize="xs" color="gray.500" mt={2}>*Menampilkan semua riwayat permintaan terkait email ini.</Text>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Box>

          {/* RESULTS SECTION */}
          {searched && (
            <VStack gap={4} align="stretch">
              <HStack>
                 <Text fontWeight="bold" color="gray.700">Hasil Pencarian</Text>
                 <Separator flex={1} />
              </HStack>

              {loading ? (
                <Card.Root p={8} bg="white" shadow="sm">
                   <VStack>
                      <Spinner color={BPS.blue} size="lg" />
                      <Text color="gray.500">Sedang mengambil data...</Text>
                   </VStack>
                </Card.Root>
              ) : requests.length === 0 ? (
                <Card.Root p={10} bg="white" shadow="sm" textAlign="center">
                   <VStack color="gray.400">
                      <FiPackage size={48} />
                      <Text color="gray.600" fontWeight="medium">Data tidak ditemukan</Text>
                      <Text fontSize="sm">Pastikan ID atau Email yang Anda masukkan sudah benar.</Text>
                   </VStack>
                </Card.Root>
              ) : (
                <VStack gap={6}>
                  {requests.map((req) => (
                    <Box 
                      key={req.id} 
                      bg="white" 
                      shadow="md" 
                      borderRadius="lg" 
                      overflow="hidden"
                      borderLeft="6px solid"
                      borderLeftColor={getStatusColor(req.status)}
                      transition="transform 0.2s"
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    >
                      {/* Ticket Header */}
                      <Box bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor={BPS.border}>
                        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                          <HStack>
                             <Badge variant="outline" colorPalette="gray">ID: {req.id}</Badge>
                             <HStack color="gray.500" fontSize="sm">
                                <FiCalendar />
                                <Text>{formatDate(req.createdAt)}</Text>
                             </HStack>
                          </HStack>
                          {getStatusBadge(req.status)}
                        </Flex>
                      </Box>

                      {/* Ticket Body */}
                      <Box p={6}>
                        {/* User Info */}
                        <HStack mb={6} align="start">
                           <Box p={2} bg="blue.50" color={BPS.blue} borderRadius="full">
                              <FiUser size={20} />
                           </Box>
                           <Box>
                              <Text fontWeight="bold" color="gray.800">{req.user.nama}</Text>
                              <Text fontSize="sm" color="gray.500">{req.user.email}</Text>
                           </Box>
                        </HStack>

                        {/* Items Table */}
                        <Box border="1px solid" borderColor={BPS.border} borderRadius="md" overflow="hidden">
                           <Table.Root size="sm" striped>
                              <Table.Header bg="gray.50">
                                <Table.Row>
                                  <Table.ColumnHeader color="gray.600">Barang</Table.ColumnHeader>
                                  <Table.ColumnHeader textAlign="right" color="gray.600">Diminta</Table.ColumnHeader>
                                  <Table.ColumnHeader textAlign="right" color="gray.600">Disetujui</Table.ColumnHeader>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {req.items.map((item) => (
                                  <Table.Row key={item.id}>
                                    <Table.Cell fontWeight="medium" color="gray.700">{item.barang.nama}</Table.Cell>
                                    <Table.Cell textAlign="right">{item.jumlahDiminta} {item.barang.satuan}</Table.Cell>
                                    <Table.Cell textAlign="right" fontWeight="bold" color={item.jumlahDisetujui > 0 ? BPS.green : "gray.400"}>
                                      {item.jumlahDisetujui > 0 ? `${item.jumlahDisetujui} ${item.barang.satuan}` : "-"}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                           </Table.Root>
                        </Box>
                        
                        {/* Catatan Section */}
                        {req.catatan && (
                           <Box mt={4} p={3} bg="orange.50" border="1px dashed" borderColor="orange.200" borderRadius="md">
                              <Text fontSize="xs" color="orange.700" fontWeight="bold">Catatan Pengajuan:</Text>
                              <Text fontSize="sm" color="gray.700" mt={1}>"{req.catatan}"</Text>
                           </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          )}

          {/* Footer CTA */}
          <Box textAlign="center" pt={4} pb={8}>
            <Text color="gray.500" fontSize="sm">
              Ingin mengajukan permintaan baru?{" "}
              <Link href="/request" style={{ color: BPS.blue, fontWeight: "bold", textDecoration: "underline" }}>
                Klik di sini
              </Link>
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
      <Box minH="100vh" bg={BPS.grayBg} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color={BPS.blue} />
      </Box>
    }>
      <TrackingContent />
    </Suspense>
  );
}