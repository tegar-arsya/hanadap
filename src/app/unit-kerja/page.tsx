import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
import { FiPackage, FiClipboard, FiClock, FiCheck } from "react-icons/fi";

export default async function UnitKerjaDashboard() {
    const session = await getServerSession(authOptions);

    const [totalBarang, userRequests, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count({ where: { stokTotal: { gt: 0 } } }),
            prisma.request.count({ where: { userId: session?.user?.id } }),
            prisma.request.count({
                where: { userId: session?.user?.id, status: "PENDING" },
            }),
            prisma.request.count({
                where: { userId: session?.user?.id, status: "APPROVED" },
            }),
        ]);

    const stats = [
        {
            label: "Barang Tersedia",
            value: totalBarang,
            icon: FiPackage,
            color: "blue",
            help: "Barang dengan stok",
        },
        {
            label: "Total Request",
            value: userRequests,
            icon: FiClipboard,
            color: "purple",
            help: "Request Anda",
        },
        {
            label: "Request Pending",
            value: pendingRequests,
            icon: FiClock,
            color: "orange",
            help: "Menunggu approval",
        },
        {
            label: "Request Disetujui",
            value: approvedRequests,
            icon: FiCheck,
            color: "green",
            help: "Sudah disetujui",
        },
    ];

    return (
        <Box>
            <VStack align="start" gap={1} mb={8}>
                <Heading size="lg">Dashboard Unit Kerja</Heading>
                <Text color="gray.500">
                    Selamat datang, {session?.user?.name}
                </Text>
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
