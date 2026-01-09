"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
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
// Tidak perlu object BPS di sini jika kita pakai Tailwind classes, tapi kept for reference
// Blue: #005DA6 | Orange: #F7931E | Green: #8CC63F

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
interface SidebarItemProps {
    menu: MenuItem;
    isCollapsed: boolean;
    variant: "admin" | "unit-kerja";
}

const SidebarItem = ({ menu, isCollapsed, variant }: SidebarItemProps) => {
    const pathname = usePathname();
    const isActive = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

    const Icon = menu.icon;

    // Admin: Blue Theme | Unit Kerja: Green Theme
    const activeClasses = variant === "admin"
        ? "bg-[#005DA6] text-white shadow-lg shadow-blue-500/30"
        : "bg-[#8CC63F] text-white shadow-lg shadow-green-500/30";

    const inactiveClasses = "text-gray-500 hover:bg-gray-50 hover:text-gray-900";

    return (
        <Link href={menu.href} className="w-full px-3 mb-1 block group" title={isCollapsed ? menu.label : undefined}>
            <div
                className={`
                    flex items-center p-3 rounded-xl transition-all duration-300 ease-in-out
                    ${isActive ? activeClasses : inactiveClasses}
                    ${isCollapsed ? "justify-center" : "gap-3"}
                `}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : ""}`} />
                {!isCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">{menu.label}</span>
                )}

                {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                )}
            </div>
        </Link>
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
    const { isCollapsed, toggleCollapse, closeMobile } = useSidebar();

    const brandGradient = variant === "admin"
        ? "from-[#005DA6] to-[#00457C]"
        : "from-[#8CC63F] to-[#7CB342]";

    const badgeColor = variant === "admin" ? "bg-blue-100 text-[#005DA6]" : "bg-green-100 text-green-700";

    const SidebarContent = (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-sm relative z-50">
            {/* HEADER */}
            <div className={`h-20 flex items-center px-5 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 bg-gradient-to-br ${brandGradient} rounded-xl flex items-center justify-center text-white shadow-md`}>
                            <FiGrid className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h1>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold mt-0.5 self-start ${badgeColor}`}>
                                {badgeText}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className={`w-9 h-9 bg-gradient-to-br ${brandGradient} rounded-xl flex items-center justify-center text-white shadow-md`}>
                        <span className="text-xs font-bold">BPS</span>
                    </div>
                )}
            </div>

            {/* SEPARATOR */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mx-4 mb-4" />

            {/* MENU ITEMS */}
            <div className="flex-1 flex flex-col gap-0.5 overflow-y-auto custom-scrollbar px-1">
                {menus.filter((m) => !m.hidden).map((menu) => (
                    <SidebarItem key={menu.href} menu={menu} isCollapsed={isCollapsed} variant={variant} />
                ))}
            </div>

            {/* FOOTER */}
            <div className="p-4 mx-3 mb-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-3">
                    {/* COLLAPSE TOGGLE (Desktop) */}
                    <div className={`hidden lg:flex w-full ${isCollapsed ? "justify-center" : "justify-end"}`}>
                        <button
                            onClick={toggleCollapse}
                            className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm transition-all ${!isCollapsed ? "ml-auto" : ""}`}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* SEPARATOR */}
                    {!isCollapsed && <div className="h-px bg-gray-200" />}

                    {/* USER INFO */}
                    <div className={`flex w-full ${isCollapsed ? "justify-center" : "justify-between"} items-center`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-9 h-9 bg-gradient-to-br ${brandGradient} rounded-full flex flex-shrink-0 items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm`}>
                                {session?.user?.name?.charAt(0) || "U"}
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-gray-800 truncate block">
                                        {session?.user?.name || "Pengguna"}
                                    </span>
                                    <span className="text-[10px] text-gray-500 truncate block">
                                        {session?.user?.email || "user@bps.go.id"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="p-2 ml-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                aria-label="Logout"
                                title="Keluar"
                            >
                                <FiLogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:block fixed h-screen z-50 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isCollapsed ? "w-[88px]" : "w-[280px]"}`}
            >
                {SidebarContent}
            </aside>

            {/* Mobile Sidebar */}
            <aside
                className={`
                    lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-[100] shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${useSidebar().isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={closeMobile}
                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
                {SidebarContent}
            </aside>
        </>
    );
}

// --- MOBILE HEADER ---
export function MobileHeader({ title, variant }: { title: string; variant: "admin" | "unit-kerja" }) {
    const { toggleMobile } = useSidebar();
    const brandGradient = variant === "admin"
        ? "from-[#005DA6] to-[#00457C]"
        : "from-[#8CC63F] to-[#7CB342]";

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 z-40 shadow-sm">
            <button
                onClick={toggleMobile}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
            >
                <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${brandGradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                    <FiGrid className="w-4 h-4" />
                </div>
                <h1 className="text-sm font-semibold text-gray-800">{title}</h1>
            </div>
            <div className="w-10" />
        </header>
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
    const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();

    return (
        <div className="flex min-h-screen bg-[#F0F2F5] font-sans selection:bg-[#005DA6] selection:text-white">
            <Sidebar menus={menus} variant={variant} title={title} badgeText={badgeText} />

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-200"
                    onClick={closeMobile}
                />
            )}

            <MobileHeader title={title} variant={variant} />

            <main
                className={`
                    flex-1 pt-20 lg:pt-8 pb-8 px-4 md:px-8 w-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                    ${isCollapsed ? "lg:ml-[88px]" : "lg:ml-[280px]"}
                `}
            >
                <div className="max-w-7xl mx-auto animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}