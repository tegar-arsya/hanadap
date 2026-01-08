"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { FiActivity, FiClipboard, FiPackage, FiShield, FiArrowRight, FiMenu } from "react-icons/fi";

// Definisi Warna BPS (Hardcoded untuk presisi)
const BPS_COLORS = {
  blue: "#005DA6",      // Primary Branding
  darkBlue: "#00457C",  // Hover/Darker areas
  orange: "#F7931E",    // CTA / Actions
  green: "#8CC63F",     // Success / Accents
  bg: "#F4F6F9",        // Professional Light Gray Background
};

const features = [
  {
    title: "Kelola Stok",
    desc: "Master data barang, kategori, dan batching FIFO untuk stok masuk/keluar.",
    icon: FiPackage,
    color: BPS_COLORS.blue,
  },
  {
    title: "Permintaan & Approval",
    desc: "Alur permintaan unit kerja dengan multi-level approval dan activity log.",
    icon: FiClipboard,
    color: BPS_COLORS.orange,
  },
  {
    title: "Audit & Keamanan",
    desc: "Activity log detail, role-based access, dan notifikasi status.",
    icon: FiShield,
    color: BPS_COLORS.green,
  },
  {
    title: "Insight Cepat",
    desc: "Laporan, status stok minimum, dan dashboard ringkas untuk admin.",
    icon: FiActivity,
    color: BPS_COLORS.blue,
  },
];

export default function Home() {
  return (
    <Box minH="100vh" bg={BPS_COLORS.bg} fontFamily="sans-serif">
      {/* --- NAVBAR --- */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4} px={{ base: 6, md: 10 }}>
        <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
          <HStack gap={3}>
            {/* Logo Placeholder (Bisa diganti Image BPS) */}
            <Box w={8} h={8} bg={BPS_COLORS.blue} borderRadius="md" />
            <Heading size="md" color={BPS_COLORS.blue}>
              Sistem Logistik BPS
            </Heading>
          </HStack>
          <Button variant="ghost" color={BPS_COLORS.blue} fontWeight="bold" asChild>
            <Link href="/login">Login Admin</Link>
          </Button>
        </Flex>
      </Box>

      {/* --- HERO SECTION --- */}
      <Box 
        bg={BPS_COLORS.blue} 
        color="white" 
        pt={{ base: 16, md: 24 }} 
        pb={{ base: 24, md: 32 }}
        pos="relative"
        overflow="hidden"
      >
        {/* Dekorasi Background Abstrak */}
        <Box pos="absolute" top="-10%" right="-5%" w="300px" h="300px" bg="whiteAlpha.100" borderRadius="full" blur="3xl" />
        <Box pos="absolute" bottom="-10%" left="-10%" w="400px" h="400px" bg="whiteAlpha.100" borderRadius="full" blur="3xl" />

        <Container maxW="4xl" textAlign="center" pos="relative" zIndex={1}>
          <VStack gap={6}>
            <Badge 
              bg="whiteAlpha.200" 
              color="white" 
              px={4} 
              py={1} 
              borderRadius="full" 
              fontSize="sm" 
              border="1px solid"
              borderColor="whiteAlpha.300"
            >
              Internal Use Only • Badan Pusat Statistik
            </Badge>
            
            <Heading size={{ base: "2xl", md: "3xl" }} fontWeight="800" lineHeight="1.2">
              Tata Kelola Stok & Permintaan<br />
              <Text as="span" color={BPS_COLORS.orange}>Terintegrasi & Transparan</Text>
            </Heading>

            <Text fontSize={{ base: "lg", md: "xl" }} color="whiteAlpha.800" maxW="2xl">
              Platform internal untuk efisiensi pengelolaan aset, pengajuan permintaan unit kerja, 
              dan monitoring stok secara <i>real-time</i>.
            </Text>

            <HStack gap={4} flexWrap="wrap" justify="center" mt={4}>
              {/* Primary Button: Warna Orange BPS agar kontras */}
              <Button 
                size="lg" 
                bg={BPS_COLORS.orange} 
                color="white" 
                _hover={{ bg: "#D87C10" }}
                px={8}
                asChild
              >
                <Link href="/request">
                  <Icon as={FiClipboard} mr={2} /> Ajukan Permintaan
                </Link>
              </Button>
              
              {/* Secondary Button: Outline Putih */}
              <Button 
                size="lg" 
                variant="outline" 
                color="white" 
                borderColor="whiteAlpha.600"
                _hover={{ bg: "whiteAlpha.200" }}
                asChild
              >
                <Link href="/tracking">Cek Status</Link>
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* --- FEATURES SECTION (Overlap Effect) --- */}
      <Container maxW="6xl" mt={{ base: -16, md: -20 }} pos="relative" zIndex={2} pb={20}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          {features.map((feature, idx) => (
            <Box
              key={idx}
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="xl"
              borderTop="4px solid"
              borderColor={feature.color}
              transition="all 0.2s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "2xl" }}
            >
              <Box 
                w={12} h={12} 
                bg={`${feature.color}1A`} // Opacity 10%
                color={feature.color}
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                borderRadius="lg"
                mb={4}
              >
                <Icon as={feature.icon} boxSize={6} />
              </Box>
              <Heading size="md" mb={2} color="gray.800">{feature.title}</Heading>
              <Text color="gray.600" fontSize="sm" lineHeight="tall">
                {feature.desc}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* --- EXTRA SECTION / QUICK ACCESS --- */}
        <Box mt={16} bg="white" borderRadius="xl" p={{ base: 6, md: 10 }} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" gap={6}>
            <VStack align="start" gap={2}>
              <Heading size="lg" color={BPS_COLORS.blue}>Butuh Bantuan Akses?</Heading>
              <Text color="gray.600">
                Silakan hubungi admin logistik atau gunakan akun demo jika dalam tahap pengembangan.
              </Text>
            </VStack>
            <HStack>
               <Button variant="ghost" color="gray.500">Panduan Pengguna</Button>
               <Button 
                 bg={BPS_COLORS.darkBlue} 
                 color="white" 
                 _hover={{ bg: BPS_COLORS.blue }}
                 asChild
               >
                 <Link href="/login">Login Administrator <Icon as={FiArrowRight} ml={2}/></Link>
               </Button>
            </HStack>
          </Flex>
        </Box>
      </Container>
      
      {/* Footer Simple */}
      <Box py={6} textAlign="center" color="gray.500" fontSize="sm">
        &copy; {new Date().getFullYear()} Badan Pusat Statistik. Internal Logistics System.
      </Box>
    </Box>
  );
}