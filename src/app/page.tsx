"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiActivity, FiClipboard, FiPackage, FiShield } from "react-icons/fi";

const features = [
  {
    title: "Kelola Stok",
    desc: "Master data barang, kategori, dan batching FIFO untuk stok masuk/keluar.",
    icon: FiPackage,
  },
  {
    title: "Permintaan & Approval",
    desc: "Alur permintaan unit kerja dengan multi-level approval dan activity log.",
    icon: FiClipboard,
  },
  {
    title: "Audit & Keamanan",
    desc: "Activity log detail, role-based access, dan notifikasi status.",
    icon: FiShield,
  },
  {
    title: "Insight Cepat",
    desc: "Laporan, status stok minimum, dan dashboard ringkas untuk admin.",
    icon: FiActivity,
  },
];

export default function Home() {
  return (
    <Box
      as="main"
      className="min-h-screen bg-gradient-to-b from-background to-content-bg text-foreground"
      px={{ base: 6, md: 10 }}
      py={{ base: 12, md: 16 }}
    >
      <Stack
        spacing={{ base: 12, md: 16 }}
        maxW="6xl"
        mx="auto"
      >
        <Stack spacing={6} textAlign={{ base: "left", md: "center" }}>
          <HStack
            justify={{ base: "flex-start", md: "center" }}
            spacing={3}
            className="text-sm font-medium text-admin-active"
          >
            <Box className="rounded-full bg-admin-activeBg/70 px-3 py-1 text-admin-active">
              Sistem Manajemen Stok & Permintaan
            </Box>
          </HStack>
          <Stack spacing={4} align={{ base: "start", md: "center" }}>
            <Heading size={{ base: "xl", md: "2xl" }}>
              Tata Kelola Stok & Permintaan Barang yang Rapi
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="3xl" color="sidebar.textMuted">
              Hanadap membantu admin dan unit kerja mengelola permintaan, approval, dan stok barang dengan cepat—tanpa spreadsheet berantakan.
            </Text>
            <HStack spacing={3} wrap="wrap">
              <Button colorPalette="blue" size="md" as={Link} href="/login">
                Masuk ke Dashboard
              </Button>
              <Button variant="ghost" size="md" colorPalette="gray" as={Link} href="/login">
                Coba sebagai Unit Kerja
              </Button>
            </HStack>
          </Stack>
        </Stack>

        <Card
          borderWidth="1px"
          borderColor="var(--card-border)"
          bg="var(--card-bg)"
          boxShadow="var(--card-shadow)"
        >
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {features.map((feature) => (
                <HStack
                  key={feature.title}
                  align="start"
                  spacing={4}
                  className="rounded-xl bg-white/60 p-4 shadow-sm ring-1 ring-card-border backdrop-blur dark:bg-card-bg/80"
                >
                  <Box className="flex h-11 w-11 items-center justify-center rounded-full bg-admin-activeBg text-admin-active">
                    <Icon as={feature.icon} boxSize={5} />
                  </Box>
                  <Stack spacing={1.5}>
                    <Heading size="sm">{feature.title}</Heading>
                    <Text fontSize="sm" color="var(--sidebar-text-muted)">
                      {feature.desc}
                    </Text>
                  </Stack>
                </HStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card
          borderWidth="1px"
          borderColor="var(--card-border)"
          bg="var(--card-bg)"
          boxShadow="var(--card-shadow)"
        >
          <CardBody>
            <Stack spacing={3}>
              <Heading size="md">Akses Cepat</Heading>
              <Text color="var(--sidebar-text-muted)">
                Gunakan kredensial seed untuk mencoba (lihat README) atau masuk dengan akun Anda.
              </Text>
              <HStack spacing={3} wrap="wrap">
                <Button colorPalette="blue" as={Link} href="/login">
                  Masuk
                </Button>
                <Button variant="outline" colorPalette="gray" as={Link} href="/admin">
                  Dashboard Admin
                </Button>
                <Button variant="outline" colorPalette="green" as={Link} href="/unit-kerja">
                  Dashboard Unit Kerja
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}
