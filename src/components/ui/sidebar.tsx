"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
    Box,
    Flex,
    VStack,
    HStack,
    Text,
    Avatar,
    Heading,
    Badge,
    IconButton,
    Portal,
    Icon,
} from "@chakra-ui/react";
import { Tooltip } from "./tooltip";
import {
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiLogOut,
    FiGrid,
} from "react-icons/fi";
import { IconType } from "react-icons";

// --- KONFIGURASI WARNA BPS ---
const BPS = {
    blue: "#005DA6",
    darkBlue: "#00457C",
    green: "#8CC63F",
    grayBg: "#F7F8FA",
};

export interface MenuItem {
    href: string;
    label: string;
    icon: IconType;
    hidden?: boolean;
}

interface SidebarContextType {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapse: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within SidebarProvider");
    return context;
};

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("bps-sidebar-collapsed");
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            localStorage.setItem("bps-sidebar-collapsed", JSON.stringify(!prev));
            return !prev;
        });
    };

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);
    const pathname = usePathname();
    useEffect(() => closeMobile(), [pathname]);

    return (
        <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile }}>
            {children}
        </SidebarContext.Provider>
    );
}

// --- ITEM SIDEBAR ---
const SidebarItem = ({ menu, isCollapsed, variant }: { menu: MenuItem; isCollapsed: boolean; variant: "admin" | "unit-kerja" }) => {
    const pathname = usePathname();
    const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

    const activeColor = variant === "admin" ? BPS.blue : BPS.green;
    const activeBg = "#EBF8FF";
    const hoverBg = "gray.50";
    const textColor = "gray.600";
    const activeTextColor = activeColor;

    return (
        <Tooltip content={menu.label} disabled={!isCollapsed} placement="right" openDelay={500}>
            <Link href={menu.href} style={{ width: "100%" }}>
                <HStack
                    px={3}
                    py={3}
                    mx={2}
                    borderRadius="md"
                    cursor="pointer"
                    bg={isActive ? activeBg : "transparent"}
                    color={isActive ? activeTextColor : textColor}
                    fontWeight={isActive ? "bold" : "medium"}
                    borderRight={isActive ? "3px solid" : "3px solid transparent"}
                    borderColor={isActive ? activeColor : "transparent"}
                    transition="all 0.2s"
                    _hover={{
                        bg: isActive ? activeBg : hoverBg,
                        color: isActive ? activeTextColor : "gray.900",
                    }}
                    justify={isCollapsed ? "center" : "flex-start"}
                >
                    <Icon as={menu.icon} boxSize={5} />
                    {!isCollapsed && (
                        <Text fontSize="sm" whiteSpace="nowrap">
                            {menu.label}
                        </Text>
                    )}
                </HStack>
            </Link>
        </Tooltip>
    );
};

// --- SIDEBAR UTAMA ---
interface SidebarProps {
    menus: MenuItem[];
    variant: "admin" | "unit-kerja";
    title: string;
    badgeText: string;
}

export function Sidebar({ menus, variant, title, badgeText }: SidebarProps) {
    const { data: session } = useSession();
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();

    const sidebarWidth = isCollapsed ? "70px" : "260px";
    const brandColor = variant === "admin" ? BPS.blue : BPS.green;

    const bgSidebar = "white";
    const borderColor = "gray.200";
    const headerText = "gray.800";
    const footerBg = "gray.50";

    const SidebarContent = (
        <Flex direction="column" h="full" bg={bgSidebar} borderRight="1px solid" borderColor={borderColor}>
            {/* HEADER */}
            <Flex h="64px" align="center" justify={isCollapsed ? "center" : "space-between"} px={4} borderBottom="1px solid" borderColor={borderColor}>
                {!isCollapsed ? (
                    <HStack gap={3}>
                        <Flex w={8} h={8} bg={brandColor} borderRadius="md" align="center" justify="center" color="white">
                            <FiGrid />
                        </Flex>
                        <VStack align="start" gap={0} lineHeight="shorter">
                            <Heading size="sm" color={headerText}>{title}</Heading>
                            <Badge colorPalette={variant === "admin" ? "blue" : "green"} variant="solid" size="xs">
                                {badgeText}
                            </Badge>
                        </VStack>
                    </HStack>
                ) : (
                    <Flex w={8} h={8} bg={brandColor} borderRadius="md" align="center" justify="center" color="white">
                        <Text fontWeight="bold" fontSize="xs">BPS</Text>
                    </Flex>
                )}
            </Flex>

            {/* MENU ITEMS */}
            <VStack flex={1} align="stretch" py={6} gap={1} overflowY="auto">
                {menus.filter((m) => !m.hidden).map((menu) => (
                    <SidebarItem key={menu.href} menu={menu} isCollapsed={isCollapsed} variant={variant} />
                ))}
            </VStack>

            {/* FOOTER */}
            <Box p={4} borderTop="1px solid" borderColor={borderColor} bg={footerBg}>
                <VStack gap={4}>
                    {/* COLLAPSE TOGGLE (Desktop) */}
                    <HStack w="full" justify={isCollapsed ? "center" : "flex-end"}>
                        <Box display={{ base: "none", lg: isCollapsed ? "none" : "block" }}>
                            <IconButton
                                aria-label="Collapse"
                                size="xs"
                                variant="outline"
                                bg="white"
                                borderColor={borderColor}
                                onClick={toggleCollapse}
                            >
                                <FiChevronLeft />
                            </IconButton>
                        </Box>
                    </HStack>

                    {/* Expand Toggle when Collapsed */}
                    {isCollapsed && (
                        <IconButton
                            aria-label="Expand"
                            size="xs"
                            variant="outline"
                            bg="white"
                            display={{ base: "none", lg: "flex" }}
                            onClick={toggleCollapse}
                        >
                            <FiChevronRight />
                        </IconButton>
                    )}

                    {/* USER INFO */}
                    <HStack w="full" justify={isCollapsed ? "center" : "space-between"}>
                        <HStack gap={3}>
                            <Avatar.Root size="sm" bg={brandColor} color="white">
                                <Avatar.Fallback name={session?.user?.name || "User"} />
                            </Avatar.Root>
                            {!isCollapsed && (
                                <VStack align="start" gap={0}>
                                    <Text fontSize="xs" fontWeight="bold" color={headerText} lineClamp={1}>
                                        {session?.user?.name || "Pengguna"}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" lineClamp={1}>
                                        {session?.user?.email || "user@bps.go.id"}
                                    </Text>
                                </VStack>
                            )}
                        </HStack>

                        {!isCollapsed && (
                            <IconButton
                                aria-label="Logout"
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                                <FiLogOut />
                            </IconButton>
                        )}
                    </HStack>
                </VStack>
            </Box>
        </Flex>
    );

    return (
        <>
            <Box
                as="aside"
                display={{ base: "none", lg: "block" }}
                w={sidebarWidth}
                position="fixed"
                h="100vh"
                zIndex={50}
                transition="width 0.2s ease"
            >
                {SidebarContent}
            </Box>

            {isMobileOpen && (
                <Portal>
                    <Box position="fixed" inset={0} bg="blackAlpha.600" zIndex={99} onClick={closeMobile} display={{ lg: "none" }} />
                </Portal>
            )}

            <Box
                as="aside"
                display={{ base: "block", lg: "none" }}
                position="fixed"
                left={0} top={0} bottom={0}
                w="280px"
                bg={bgSidebar}
                zIndex={100}
                transform={isMobileOpen ? "translateX(0)" : "translateX(-100%)"}
                transition="transform 0.3s ease"
                shadow="2xl"
            >
                <Flex justify="flex-end" p={2} position="absolute" right={0} top={0}>
                    <IconButton aria-label="Close" variant="ghost" onClick={closeMobile} color="black">
                        <FiX />
                    </IconButton>
                </Flex>
                {SidebarContent}
            </Box>
        </>
    );
}

// --- MOBILE HEADER ---
export function MobileHeader({ title, variant }: { title: string; variant: "admin" | "unit-kerja" }) {
    const { toggleMobile } = useSidebar();
    const brandColor = variant === "admin" ? BPS.blue : BPS.green;

    return (
        <Flex
            display={{ base: "flex", lg: "none" }}
            position="fixed"
            top={0} left={0} right={0}
            h="64px"
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.200"
            align="center"
            justify="space-between"
            px={4}
            zIndex={40}
        >
            <IconButton
                aria-label="Menu"
                variant="ghost"
                onClick={toggleMobile}
                color="gray.600"
            >
                <FiMenu size={24} />
            </IconButton>
            <HStack>
                <Flex w={6} h={6} bg={brandColor} borderRadius="sm" align="center" justify="center" color="white">
                    <FiGrid size={14} />
                </Flex>
                <Heading size="sm" color="gray.800">{title}</Heading>
            </HStack>
            <Box w={8} />
        </Flex>
    );
}

// --- LAYOUT WRAPPER ---
interface DashboardLayoutProps {
    children: ReactNode;
    menus: MenuItem[];
    variant: "admin" | "unit-kerja";
    title: string;
    badgeText: string;
}

export function DashboardLayout({ children, menus, variant, title, badgeText }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <LayoutContent menus={menus} variant={variant} title={title} badgeText={badgeText}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}

function LayoutContent({ children, menus, variant, title, badgeText }: DashboardLayoutProps) {
    const { isCollapsed } = useSidebar();
    const sidebarWidth = isCollapsed ? "70px" : "260px";

    return (
        <Flex minH="100vh" bg={BPS.grayBg}>
            <Sidebar menus={menus} variant={variant} title={title} badgeText={badgeText} />
            <MobileHeader title={title} variant={variant} />

            <Box
                flex={1}
                ml={{ base: 0, lg: sidebarWidth }}
                pt={{ base: "64px", lg: 0 }}
                transition="margin-left 0.2s ease"
                w="full"
            >
                <Box p={{ base: 4, md: 8 }} maxW="100%">
                    {children}
                </Box>
            </Box>
        </Flex>
    );
}