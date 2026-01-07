"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { useTheme } from "next-themes";
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
    IconButton,
    Portal,
} from "@chakra-ui/react";
import {
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiLogOut,
    FiSun,
    FiMoon,
    FiMonitor,
} from "react-icons/fi";
import { IconType } from "react-icons";

// Types
interface MenuItem {
    href: string;
    label: string;
    icon: IconType;
}

interface SidebarContextType {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggleCollapse: () => void;
    toggleMobile: () => void;
    closeMobile: () => void;
}

// Context
const SidebarContext = createContext<SidebarContextType | null>(null);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
};

// Provider Component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            localStorage.setItem("sidebar-collapsed", JSON.stringify(!prev));
            return !prev;
        });
    };

    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    // Close mobile sidebar on route change
    const pathname = usePathname();
    useEffect(() => {
        closeMobile();
    }, [pathname]);

    return (
        <SidebarContext.Provider
            value={{ isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

// Sidebar Component
interface SidebarProps {
    menus: MenuItem[];
    variant: "admin" | "unit-kerja";
    title: string;
    badgeText: string;
}

export function Sidebar({ menus, variant, title, badgeText }: SidebarProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const colorScheme = variant === "admin" ? "blue" : "green";

    // Theme-aware colors
    const sidebarBg = "var(--sidebar-bg)";
    const borderColor = "var(--sidebar-border)";
    const textColor = "var(--sidebar-text)";
    const textMuted = "var(--sidebar-text-muted)";
    const hoverBg = "var(--sidebar-hover)";
    const activeBg = variant === "admin" ? "var(--active-bg-admin)" : "var(--active-bg-unit)";
    const activeColor = variant === "admin" ? "var(--active-color-admin)" : "var(--active-color-unit)";

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    const getThemeIcon = () => {
        if (!mounted) return <FiSun size={18} />;
        if (theme === "light") return <FiSun size={18} />;
        if (theme === "dark") return <FiMoon size={18} />;
        return <FiMonitor size={18} />;
    };

    const sidebarWidth = isCollapsed ? "80px" : "260px";

    const SidebarContent = (
        <VStack gap={4} align="stretch" h="full" py={4}>
            {/* Logo Section */}
            <HStack
                px={isCollapsed ? 2 : 4}
                justify={isCollapsed ? "center" : "space-between"}
                align="center"
            >
                {!isCollapsed && (
                    <VStack gap={0} align="start">
                        <Heading size="md" color={activeColor} fontWeight="bold">
                            {title}
                        </Heading>
                        <Badge
                            colorPalette={colorScheme}
                            fontSize="xs"
                            variant="subtle"
                        >
                            {badgeText}
                        </Badge>
                    </VStack>
                )}
                {isCollapsed && (
                    <Heading size="md" color={activeColor} fontWeight="bold">
                        H
                    </Heading>
                )}
            </HStack>

            {/* Collapse Toggle - Desktop Only */}
            <Box display={{ base: "none", lg: "block" }} px={2}>
                <IconButton
                    aria-label="Toggle sidebar"
                    variant="ghost"
                    size="sm"
                    w="full"
                    onClick={toggleCollapse}
                    color={textMuted}
                    _hover={{ bg: hoverBg, color: textColor }}
                >
                    {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                </IconButton>
            </Box>

            {/* Navigation */}
            <VStack gap={1} align="stretch" px={2} flex={1}>
                {menus.map((menu) => {
                    const isActive = pathname === menu.href;
                    const IconComponent = menu.icon;
                    return (
                        <Link key={menu.href} href={menu.href}>
                            <HStack
                                px={3}
                                py={2.5}
                                borderRadius="lg"
                                bg={isActive ? activeBg : "transparent"}
                                color={isActive ? activeColor : textMuted}
                                fontWeight={isActive ? "semibold" : "normal"}
                                _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : textColor }}
                                transition="all 0.2s"
                                gap={3}
                                justify={isCollapsed ? "center" : "flex-start"}
                                title={isCollapsed ? menu.label : undefined}
                            >
                                <IconComponent size={20} style={{ flexShrink: 0 }} />
                                {!isCollapsed && (
                                    <Text fontSize="sm" whiteSpace="nowrap">
                                        {menu.label}
                                    </Text>
                                )}
                            </HStack>
                        </Link>
                    );
                })}
            </VStack>

            {/* Bottom Section */}
            <VStack gap={2} px={2} align="stretch">
                {/* Theme Toggle */}
                <HStack
                    px={3}
                    py={2}
                    justify={isCollapsed ? "center" : "space-between"}
                    borderRadius="lg"
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onClick={cycleTheme}
                    color={textMuted}
                    transition="all 0.2s"
                >
                    {!isCollapsed && (
                        <Text fontSize="sm">
                            {mounted && (theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System")}
                        </Text>
                    )}
                    {getThemeIcon()}
                </HStack>

                {/* User Info */}
                <HStack
                    gap={3}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    justify={isCollapsed ? "center" : "flex-start"}
                >
                    <Avatar.Root size="sm" colorPalette={colorScheme}>
                        <Avatar.Fallback>
                            {(session?.user?.name || "U").substring(0, 2).toUpperCase()}
                        </Avatar.Fallback>
                    </Avatar.Root>
                    {!isCollapsed && (
                        <VStack align="start" gap={0} flex={1} overflow="hidden">
                            <Text fontSize="sm" fontWeight="medium" color={textColor} lineClamp={1}>
                                {session?.user?.name}
                            </Text>
                            <Text fontSize="xs" color={textMuted}>
                                {badgeText}
                            </Text>
                        </VStack>
                    )}
                </HStack>

                {/* Logout Button */}
                <Button
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    justifyContent={isCollapsed ? "center" : "flex-start"}
                    px={3}
                >
                    <FiLogOut size={18} />
                    {!isCollapsed && <Text ml={2}>Keluar</Text>}
                </Button>
            </VStack>
        </VStack>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <Box
                as="aside"
                display={{ base: "none", lg: "block" }}
                w={sidebarWidth}
                bg={sidebarBg}
                borderRight="1px solid"
                borderColor={borderColor}
                position="fixed"
                h="100vh"
                overflowY="auto"
                overflowX="hidden"
                transition="width 0.2s ease"
                zIndex={100}
                className="sidebar"
            >
                {SidebarContent}
            </Box>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <Portal>
                    <Box
                        position="fixed"
                        inset={0}
                        bg="blackAlpha.600"
                        zIndex={199}
                        onClick={closeMobile}
                        display={{ base: "block", lg: "none" }}
                    />
                </Portal>
            )}

            {/* Mobile Sidebar */}
            <Box
                as="aside"
                display={{ base: "block", lg: "none" }}
                position="fixed"
                left={0}
                top={0}
                h="100vh"
                w="280px"
                bg={sidebarBg}
                borderRight="1px solid"
                borderColor={borderColor}
                transform={isMobileOpen ? "translateX(0)" : "translateX(-100%)"}
                transition="transform 0.3s ease"
                zIndex={200}
                overflowY="auto"
                className="sidebar"
            >
                <HStack justify="flex-end" p={2}>
                    <IconButton
                        aria-label="Close sidebar"
                        variant="ghost"
                        size="sm"
                        onClick={closeMobile}
                        color={textMuted}
                    >
                        <FiX size={20} />
                    </IconButton>
                </HStack>
                {SidebarContent}
            </Box>
        </>
    );
}

// Mobile Header Component
interface MobileHeaderProps {
    title: string;
    variant: "admin" | "unit-kerja";
}

export function MobileHeader({ title, variant }: MobileHeaderProps) {
    const { toggleMobile } = useSidebar();
    const activeColor = variant === "admin" ? "var(--active-color-admin)" : "var(--active-color-unit)";

    return (
        <HStack
            display={{ base: "flex", lg: "none" }}
            position="fixed"
            top={0}
            left={0}
            right={0}
            h="56px"
            px={4}
            bg="var(--header-bg)"
            borderBottom="1px solid"
            borderColor="var(--sidebar-border)"
            zIndex={50}
            justify="space-between"
            className="mobile-header"
        >
            <IconButton
                aria-label="Open menu"
                variant="ghost"
                size="sm"
                onClick={toggleMobile}
            >
                <FiMenu size={24} />
            </IconButton>
            <Heading size="sm" color={activeColor}>
                {title}
            </Heading>
            <Box w="40px" />
        </HStack>
    );
}

// Main Layout Wrapper
interface DashboardLayoutProps {
    children: React.ReactNode;
    menus: MenuItem[];
    variant: "admin" | "unit-kerja";
    title: string;
    badgeText: string;
}

export function DashboardLayout({ children, menus, variant, title, badgeText }: DashboardLayoutProps) {
    const { isCollapsed } = useSidebar();
    const sidebarWidth = isCollapsed ? "80px" : "260px";

    return (
        <Flex minH="100vh" className="dashboard-layout">
            <Sidebar menus={menus} variant={variant} title={title} badgeText={badgeText} />
            <MobileHeader title={title} variant={variant} />
            <Box
                ml={{ base: 0, lg: sidebarWidth }}
                pt={{ base: "56px", lg: 0 }}
                flex={1}
                bg="var(--content-bg)"
                minH="100vh"
                transition="margin-left 0.2s ease"
                className="main-content"
            >
                <Box p={{ base: 4, md: 6, lg: 8 }}>
                    {children}
                </Box>
            </Box>
        </Flex>
    );
}
