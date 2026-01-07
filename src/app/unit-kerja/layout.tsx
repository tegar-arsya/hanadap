"use client";

import {
    FiHome,
    FiPackage,
    FiEdit,
    FiSearch,
    FiCornerDownLeft,
    FiUser,
} from "react-icons/fi";
import { SidebarProvider, DashboardLayout } from "@/components/ui/sidebar";

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
    return (
        <SidebarProvider>
            <DashboardLayout
                menus={unitKerjaMenus}
                variant="unit-kerja"
                title="Hanadap"
                badgeText="Unit Kerja"
            >
                {children}
            </DashboardLayout>
        </SidebarProvider>
    );
}
