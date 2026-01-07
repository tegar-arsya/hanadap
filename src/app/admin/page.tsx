import { prisma } from "@/lib/prisma";
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Card,
    Stat,
    HStack,
    VStack,
} from "@chakra-ui/react";
import { FiPackage, FiLayers, FiClock, FiCheck } from "react-icons/fi";

export default async function AdminDashboard() {
    const [totalBarang, totalStok, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count(),
            prisma.barang.aggregate({ _sum: { stokTotal: true } }),
            prisma.request.count({ where: { status: "PENDING" } }),
            prisma.request.count({ where: { status: "APPROVED" } }),
        ]);

    const stats = [
        {
            label: "Total Barang",
            value: totalBarang,
            icon: FiPackage,
            color: "blue",
            help: "Jenis barang terdaftar",
        },
        {
            label: "Total Stok",
            value: totalStok._sum.stokTotal || 0,
            icon: FiLayers,
            color: "green",
            help: "Unit tersedia",
        },
        {
            label: "Request Pending",
            value: pendingRequests,
            icon: FiClock,
            color: "orange",
            help: "Menunggu persetujuan",
        },
        {
            label: "Request Disetujui",
            value: approvedRequests,
            icon: FiCheck,
            color: "teal",
            help: "Total disetujui",
        },
    ];

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Dashboard Admin</Heading>
                <Text color="gray.500">Selamat datang di Hanadap Inventory System</Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
                {stats.map((stat) => {
                    const IconComponent = stat.icon;
                    return (
                        <Card.Root key={stat.label}>
                            <Card.Body>
                                <HStack gap={4}>
                                    <Box
                                        p={3}
                                        borderRadius="lg"
                                        bg={`${stat.color}.50`}
                                        color={`${stat.color}.500`}
                                    >
                                        <IconComponent size={24} />
                                    </Box>
                                    <Stat.Root>
                                        <Stat.Label color="gray.500" fontSize="sm">
                                            {stat.label}
                                        </Stat.Label>
                                        <Stat.ValueText fontSize="2xl">{stat.value}</Stat.ValueText>
                                        <Stat.HelpText mb={0} fontSize="xs">
                                            {stat.help}
                                        </Stat.HelpText>
                                    </Stat.Root>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    );
                })}
            </SimpleGrid>
        </Box>
    );
}
