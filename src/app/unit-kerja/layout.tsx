"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Button,
    Avatar,
    Heading,
    Badge,
    Separator,
} from "@chakra-ui/react";
import {
    FiHome,
    FiPackage,
    FiEdit,
    FiSearch,
    FiCornerDownLeft,
    FiUser,
    FiLogOut,
} from "react-icons/fi";

const unitKerjaMenus = [
    { href: "/unit-kerja", label: "Dashboard", icon: FiHome },
    { href: "/unit-kerja/stok", label: "Lihat Stok", icon: FiPackage },
    { href: "/unit-kerja/request", label: "Ajukan Permintaan", icon: FiEdit },
    { href: "/unit-kerja/tracking", label: "Tracking", icon: FiSearch },
    { href: "/unit-kerja/return", label: "Pengembalian", icon: FiCornerDownLeft },
    { href: "/profil", label: "Profil Saya", icon: FiUser },
];

export default function UnitKerjaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();

    const sidebarBg = "white";
    const borderColor = "gray.100";
    const activeBg = "green.50";
    const activeColor = "green.600";

    return (
        <Flex minH="100vh">
            {/* Sidebar */}
            <Box
                w="260px"
                bg={sidebarBg}
                borderRight="1px"
                borderColor={borderColor}
                py={6}
                position="fixed"
                h="100vh"
                overflowY="auto"
            >
                <VStack gap={6} align="stretch" h="full">
                    {/* Logo */}
                    <VStack px={6} gap={1} align="start">
                        <Heading size="lg" color="green.600">
                            Hanadap
                        </Heading>
                        <Badge colorPalette="green" fontSize="xs">
                            Unit Kerja
                        </Badge>
                    </VStack>

                    <Separator />

                    {/* Navigation */}
                    <VStack gap={1} align="stretch" px={3} flex={1}>
                        {unitKerjaMenus.map((menu) => {
                            const isActive = pathname === menu.href;
                            const IconComponent = menu.icon;
                            return (
                                <Link key={menu.href} href={menu.href}>
                                    <HStack
                                        px={4}
                                        py={3}
                                        borderRadius="lg"
                                        bg={isActive ? activeBg : "transparent"}
                                        color={isActive ? activeColor : "gray.600"}
                                        fontWeight={isActive ? "semibold" : "normal"}
                                        _hover={{ bg: isActive ? activeBg : "gray.50" }}
                                        transition="all 0.2s"
                                        gap={3}
                                    >
                                        <IconComponent size={20} />
                                        <Text fontSize="sm">{menu.label}</Text>
                                    </HStack>
                                </Link>
                            );
                        })}
                    </VStack>

                    <Separator />

                    {/* User Section */}
                    <VStack px={4} gap={3} align="stretch">
                        <HStack gap={3}>
                            <Avatar.Root size="sm" bg="green.500">
                                <Avatar.Fallback>{(session?.user?.name || "User").substring(0, 2).toUpperCase()}</Avatar.Fallback>
                            </Avatar.Root>
                            <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                                    {session?.user?.name}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    Unit Kerja
                                </Text>
                            </VStack>
                        </HStack>
                        <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            justifyContent="start"
                        >
                            <FiLogOut />
                            Keluar
                        </Button>
                    </VStack>
                </VStack>
            </Box>

            {/* Main Content */}
            <Box ml="260px" flex={1} p={8} bg="gray.50" minH="100vh">
                {children}
            </Box>
        </Flex>
    );
}
