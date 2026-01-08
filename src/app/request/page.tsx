"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  NativeSelect,
  NumberInput,
  Textarea,
  Table,
  IconButton,
  Field,
  Input,
  Text,
  Heading,
  Container,
  Badge,
  Separator,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { FiPlus, FiTrash2, FiSend, FiPackage, FiUser, FiInfo, FiGrid, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const BPS = {
  blue: "#005DA6",
  darkBlue: "#00457C",
  orange: "#F7931E",
  green: "#8CC63F",
  grayBg: "#F4F7FE",
  border: "#E2E8F0",
};

interface Barang {
  id: string;
  nama: string;
  satuan: string;
  stokTotal: number;
}

interface UnitKerja {
  id: string;
  nama: string;
  kode: string;
}

interface RequestItem {
  barangId: string;
  barang: Barang;
  jumlah: number;
}

export default function PublicRequestPage() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [items, setItems] = useState<RequestItem[]>([]);
  const [selectedBarang, setSelectedBarang] = useState("");
  const [jumlah, setJumlah] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [namaPemohon, setNamaPemohon] = useState("");
  const [emailPemohon, setEmailPemohon] = useState("");
  const [unitKerjaId, setUnitKerjaId] = useState("");

  const showToast = (title: string, type: "success" | "error" | "warning") => {
    toaster.create({ title, type });
  };

  useEffect(() => {
    fetch("/api/barang")
      .then((res) => res.json())
      .then((data) => setBarangList(data.filter((b: Barang) => b.stokTotal > 0)))
      .catch(() => {});

    fetch("/api/unit-kerja")
      .then((res) => res.json())
      .then((data) => setUnitKerjaList(data))
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    const barang = barangList.find((b) => b.id === selectedBarang);
    if (!barang) return;

    if (items.some((i) => i.barangId === selectedBarang)) {
      showToast("Barang ini sudah ada di daftar permintaan", "warning");
      return;
    }

    setItems([...items, { barangId: selectedBarang, barang, jumlah: parseInt(jumlah) }]);
    setSelectedBarang("");
    setJumlah("1");
  };

  const handleRemoveItem = (barangId: string) => {
    setItems(items.filter((i) => i.barangId !== barangId));
  };

  const handleSubmit = async () => {
    if (!namaPemohon || !emailPemohon || !unitKerjaId) {
      showToast("Mohon lengkapi data pemohon", "warning");
      return;
    }

    if (items.length === 0) {
      showToast("Daftar barang masih kosong", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/request/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaPemohon,
          emailPemohon,
          unitKerjaId,
          catatan,
          items: items.map((i) => ({ barangId: i.barangId, jumlahDiminta: i.jumlah })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Permintaan berhasil diajukan!", "success");
        setItems([]);
        setCatatan("");
        setNamaPemohon("");
        setEmailPemohon("");
        setUnitKerjaId("");
        window.location.href = `/tracking?id=${data.id}`;
      } else {
        const error = await res.json();
        showToast(error.error || "Gagal mengajukan permintaan", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={BPS.grayBg} position="relative">
      {/* Background Header */}
      <Box 
        position="absolute" 
        top={0} 
        left={0} 
        right={0} 
        h={{ base: "240px", md: "280px" }}
        bg={`linear-gradient(135deg, ${BPS.blue} 0%, ${BPS.darkBlue} 100%)`}
        zIndex={0}
      >
        <Box 
          position="absolute" 
          bottom={0} 
          left={0} 
          right={0} 
          h="60px" 
          bg={BPS.grayBg}
          borderTopRadius="3xl"
        />
      </Box>

      <Container maxW="container.lg" position="relative" zIndex={1} py={{ base: 6, md: 10 }}>
        <VStack gap={8} align="stretch">
          
          {/* HEADER */}
          <Box color="white" pt={4}>
            <HStack 
              color="whiteAlpha.900" 
              mb={6}
              cursor="pointer"
              transition="all 0.2s"
              _hover={{ color: "white", transform: "translateX(-4px)" }}
            >
              <FiArrowLeft size={18} />
              <Text fontSize="sm" fontWeight="medium">Kembali ke Beranda</Text>
            </HStack>
            
            <Flex direction={{ base: "column", md: "row" }} align="start" justify="space-between" gap={6}>
              <Box flex={1}>
                <Badge 
                  bg="whiteAlpha.200" 
                  color="white" 
                  px={3} 
                  py={1.5} 
                  mb={4}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="semibold"
                  letterSpacing="wide"
                >
                  FORMULIR DIGITAL 01
                </Badge>
                <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={3}>
                  Permintaan Barang
                </Heading>
                <Text color="blue.100" fontSize={{ base: "sm", md: "md" }} maxW="2xl" lineHeight="tall">
                  Isi formulir di bawah untuk mengajukan kebutuhan ATK atau peralatan kerja unit Anda. Permintaan akan diproses sesuai ketersediaan stok.
                </Text>
              </Box>
              
              <Box 
                bg="whiteAlpha.200" 
                p={5} 
                borderRadius="2xl" 
                display={{ base: "none", md: "block" }}
                backdropFilter="blur(10px)"
              >
                <FiPackage size={48} />
              </Box>
            </Flex>
          </Box>

          {/* PROGRESS INDICATOR */}
          <Box bg="white" borderRadius="xl" p={6} shadow="sm">
            <HStack gap={4} justify="space-around" flexWrap="wrap">
              <HStack color={BPS.blue}>
                <Box bg="blue.50" p={2} borderRadius="lg">
                  <FiUser size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Step 1</Text>
                  <Text fontSize="sm" fontWeight="semibold">Data Pemohon</Text>
                </VStack>
              </HStack>
              
              <Box h="1px" flex={1} bg="gray.200" display={{ base: "none", md: "block" }} />
              
              <HStack color={items.length > 0 ? BPS.blue : "gray.400"}>
                <Box bg={items.length > 0 ? "blue.50" : "gray.100"} p={2} borderRadius="lg">
                  <FiGrid size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Step 2</Text>
                  <Text fontSize="sm" fontWeight="semibold">Pilih Barang</Text>
                </VStack>
              </HStack>
              
              <Box h="1px" flex={1} bg="gray.200" display={{ base: "none", md: "block" }} />
              
              <HStack color="gray.400">
                <Box bg="gray.100" p={2} borderRadius="lg">
                  <FiCheckCircle size={20} />
                </Box>
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">Step 3</Text>
                  <Text fontSize="sm" fontWeight="semibold">Konfirmasi</Text>
                </VStack>
              </HStack>
            </HStack>
          </Box>

          {/* MAIN CARD */}
          <Box bg="white" borderRadius="2xl" shadow="lg" overflow="hidden">
            
            {/* 1. DATA PEMOHON */}
            <Box p={{ base: 6, md: 8 }}>
              <HStack mb={6} gap={3}>
                <Box bg="blue.50" p={2.5} borderRadius="lg">
                  <FiUser size={20} color={BPS.blue} />
                </Box>
                <Box>
                  <Heading size="lg" color="gray.800">Identitas Pemohon</Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>Lengkapi informasi diri Anda</Text>
                </Box>
              </HStack>
              
              <Stack direction={{ base: "column", md: "row" }} gap={6} mb={6}>
                <Field.Root required flex={1}>
                  <Field.Label color="gray.700" fontSize="sm" fontWeight="semibold" mb={2}>
                    Nama Lengkap
                  </Field.Label>
                  <Input
                    value={namaPemohon}
                    onChange={(e) => setNamaPemohon(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    size="lg"
                    borderRadius="lg"
                    borderColor={BPS.border}
                    _focus={{ borderColor: BPS.blue, boxShadow: `0 0 0 1px ${BPS.blue}` }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                </Field.Root>

                <Field.Root required flex={1}>
                  <Field.Label color="gray.700" fontSize="sm" fontWeight="semibold" mb={2}>
                    Email Dinas
                  </Field.Label>
                  <Input
                    type="email"
                    value={emailPemohon}
                    onChange={(e) => setEmailPemohon(e.target.value)}
                    placeholder="email@bps.go.id"
                    size="lg"
                    borderRadius="lg"
                    borderColor={BPS.border}
                    _focus={{ borderColor: BPS.blue, boxShadow: `0 0 0 1px ${BPS.blue}` }}
                    _hover={{ borderColor: "gray.300" }}
                  />
                </Field.Root>
              </Stack>

              <Field.Root required>
                <Field.Label color="gray.700" fontSize="sm" fontWeight="semibold" mb={2}>
                  Unit Kerja
                </Field.Label>
                <NativeSelect.Root size="lg">
                  <NativeSelect.Field
                    value={unitKerjaId}
                    onChange={(e) => setUnitKerjaId(e.target.value)}
                    placeholder="Pilih unit kerja asal..."
                    borderRadius="lg"
                    borderColor={BPS.border}
                    _focus={{ borderColor: BPS.blue, boxShadow: `0 0 0 1px ${BPS.blue}` }}
                    _hover={{ borderColor: "gray.300" }}
                  >
                    {unitKerjaList.map((uk) => (
                      <option key={uk.id} value={uk.id}>
                        {uk.nama} — Kode: {uk.kode}
                      </option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
            </Box>

            <Separator borderColor={BPS.border} />

            {/* 2. INPUT BARANG */}
            <Box p={{ base: 6, md: 8 }} bg="blue.25">
              <HStack mb={6} justify="space-between" flexWrap="wrap" gap={4}>
                <HStack gap={3}>
                  <Box bg="white" p={2.5} borderRadius="lg" shadow="sm">
                    <FiGrid size={20} color={BPS.blue} />
                  </Box>
                  <Box>
                    <Heading size="lg" color="gray.800">Pilih Barang</Heading>
                    <Text fontSize="sm" color="gray.500" mt={1}>Tambahkan item yang dibutuhkan</Text>
                  </Box>
                </HStack>
                <Badge colorPalette="green" variant="solid" px={3} py={1.5} borderRadius="full">
                  ✓ Stok Tersedia
                </Badge>
              </HStack>

              <Stack direction={{ base: "column", lg: "row" }} gap={4} align="end">
                <Field.Root flex={3}>
                  <Field.Label color="gray.700" fontSize="sm" fontWeight="semibold" mb={2}>
                    Nama Barang
                  </Field.Label>
                  <NativeSelect.Root size="lg">
                    <NativeSelect.Field
                      bg="white"
                      value={selectedBarang}
                      onChange={(e) => setSelectedBarang(e.target.value)}
                      placeholder="Cari dan pilih barang..."
                      borderRadius="lg"
                      borderColor={BPS.border}
                      _focus={{ borderColor: BPS.blue, boxShadow: `0 0 0 1px ${BPS.blue}` }}
                    >
                      {barangList.map((barang) => (
                        <option key={barang.id} value={barang.id}>
                          {barang.nama} — Tersedia: {barang.stokTotal} {barang.satuan}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                </Field.Root>

                <Field.Root w={{ base: "full", lg: "140px" }}>
                  <Field.Label color="gray.700" fontSize="sm" fontWeight="semibold" mb={2}>
                    Jumlah
                  </Field.Label>
                  <NumberInput.Root 
                    size="lg" 
                    min={1} 
                    value={jumlah} 
                    onValueChange={(e) => setJumlah(e.value)}
                  >
                    <NumberInput.Input 
                      bg="white" 
                      borderRadius="lg"
                      borderColor={BPS.border}
                    />
                    <NumberInput.Control />
                  </NumberInput.Root>
                </Field.Root>

                <Button
                  size="lg"
                  bg={BPS.blue}
                  color="white"
                  px={8}
                  h="48px"
                  onClick={handleAddItem}
                  disabled={!selectedBarang}
                  borderRadius="lg"
                  fontWeight="semibold"
                  _hover={{ bg: BPS.darkBlue, transform: "translateY(-2px)", shadow: "md" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  w={{ base: "full", lg: "auto" }}
                >
                  <FiPlus style={{ marginRight: "8px" }} />
                  Tambahkan
                </Button>
              </Stack>
            </Box>

            <Separator borderColor={BPS.border} />

            {/* 3. DAFTAR BARANG */}
            <Box>
              {items.length === 0 ? (
                <VStack py={16} color="gray.400" bg="gray.50">
                  <Box bg="gray.100" p={6} borderRadius="2xl" mb={4}>
                    <FiPackage size={48} style={{ opacity: 0.5 }} />
                  </Box>
                  <Text fontSize="md" fontWeight="medium" color="gray.500">
                    Belum ada barang yang ditambahkan
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Pilih barang di atas untuk menambahkan ke daftar permintaan
                  </Text>
                </VStack>
              ) : (
                <Box overflowX="auto">
                  <Table.Root size="lg" variant="line">
                    <Table.Header bg="gray.50">
                      <Table.Row>
                        <Table.ColumnHeader color="gray.700" fontWeight="bold" fontSize="sm" py={4}>
                          Nama Barang
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.700" textAlign="center" fontWeight="bold" fontSize="sm">
                          Jumlah
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.700" fontWeight="bold" fontSize="sm">
                          Satuan
                        </Table.ColumnHeader>
                        <Table.ColumnHeader w="80px"></Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {items.map((item, idx) => (
                        <Table.Row 
                          key={item.barangId}
                          bg="white"
                          _hover={{ bg: "gray.50" }}
                          transition="background 0.2s"
                        >
                          <Table.Cell py={4}>
                            <HStack>
                              <Box 
                                bg="blue.50" 
                                color={BPS.blue}
                                w={8} 
                                h={8} 
                                borderRadius="lg"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="sm"
                                fontWeight="bold"
                              >
                                {idx + 1}
                              </Box>
                              <Text fontWeight="medium" color="gray.800">
                                {item.barang.nama}
                              </Text>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <Badge colorPalette="blue" variant="subtle" px={3} py={1}>
                              {item.jumlah}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell color="gray.600" fontSize="sm">
                            {item.barang.satuan}
                          </Table.Cell>
                          <Table.Cell>
                            <IconButton
                              aria-label="Hapus"
                              size="sm"
                              colorPalette="red"
                              variant="ghost"
                              borderRadius="lg"
                              onClick={() => handleRemoveItem(item.barangId)}
                              _hover={{ bg: "red.50" }}
                            >
                              <FiTrash2 />
                            </IconButton>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>

            <Separator borderColor={BPS.border} />

            {/* 4. CATATAN & SUBMIT */}
            <Box p={{ base: 6, md: 8 }} bg="gray.50">
              <Field.Root mb={8}>
                <Field.Label color="gray.700" fontWeight="semibold" mb={3}>
                  <HStack>
                    <FiInfo size={18} color={BPS.blue} />
                    <Text>Catatan Tambahan (Opsional)</Text>
                  </HStack>
                </Field.Label>
                <Textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Mohon diproses segera untuk kegiatan sensus minggu depan. Terima kasih."
                  bg="white"
                  borderColor={BPS.border}
                  borderRadius="lg"
                  _focus={{ borderColor: BPS.blue, boxShadow: `0 0 0 1px ${BPS.blue}` }}
                  rows={4}
                  resize="none"
                  fontSize="sm"
                />
              </Field.Root>

              <Flex 
                direction={{ base: "column", md: "row" }}
                justify="space-between" 
                align={{ base: "stretch", md: "center" }}
                gap={4}
              >
                <VStack align="start" gap={1} flex={1}>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    📋 Total Item: {items.length} barang
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Pastikan semua data sudah benar sebelum mengirim
                  </Text>
                </VStack>
                
                <Button
                  size="xl"
                  bg={BPS.orange}
                  color="white"
                  fontSize="md"
                  px={10}
                  h="56px"
                  onClick={handleSubmit}
                  loading={loading}
                  loadingText="Mengirim Permintaan..."
                  disabled={items.length === 0 || !namaPemohon || !emailPemohon || !unitKerjaId}
                  borderRadius="xl"
                  fontWeight="bold"
                  boxShadow="lg"
                  _hover={{ 
                    bg: "#D87C10", 
                    transform: "translateY(-2px)", 
                    boxShadow: "xl" 
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s"
                  w={{ base: "full", md: "auto" }}
                >
                  <FiSend style={{ marginRight: "10px" }} />
                  Kirim Permintaan
                </Button>
              </Flex>
            </Box>

          </Box>

          {/* FOOTER */}
          <Box 
            textAlign="center" 
            py={8} 
            bg="white" 
            borderRadius="xl" 
            shadow="sm"
          >
            <Text color="gray.600" fontSize="sm" mb={2}>
              Sudah mengajukan permintaan sebelumnya?
            </Text>
            <Button
              variant="ghost"
              colorPalette="blue"
              size="lg"
              fontWeight="semibold"
            >
              Lacak Status Permintaan →
            </Button>
          </Box>

        </VStack>
      </Container>
    </Box>
  );
}