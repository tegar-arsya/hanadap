"use client";

import {
    FiHome,
    FiPackage,
    FiUpload,
    FiClipboard,
    FiUsers,
    FiTag,
    FiGrid,
    FiSettings,
    FiActivity,
    FiFileText,
    FiUser,
    FiShoppingCart,
    FiBarChart2,
} from "react-icons/fi";
import { SidebarProvider, DashboardLayout } from "@/components/ui/sidebar";

const adminMenus = [
    { href: "/admin", label: "Dashboard", icon: FiHome },
    { href: "/admin/stok", label: "Kelola Stok", icon: FiPackage },
    { href: "/admin/import", label: "Import Barang", icon: FiUpload },
    { href: "/admin/import-pembelian", label: "Import Pembelian", icon: FiShoppingCart },
    { href: "/admin/request", label: "Permintaan", icon: FiClipboard },
    { href: "/admin/users", label: "Manajemen User", icon: FiUsers },
    { href: "/admin/kategori", label: "Kategori", icon: FiTag },
    { href: "/admin/unit-kerja", label: "Unit Kerja", icon: FiGrid },
    { href: "/admin/approval", label: "Config Approval", icon: FiSettings, hidden: true },
    { href: "/admin/activity", label: "Activity Log", icon: FiActivity },
    { href: "/admin/laporan", label: "Laporan", icon: FiFileText },
    { href: "/admin/laporan-fifo", label: "Kartu Stok FIFO", icon: FiBarChart2 },
    { href: "/profil", label: "Profil Saya", icon: FiUser },
];


export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardLayout
                menus={adminMenus}
                variant="admin"
                title="Hanadap"
                badgeText="Admin Panel"
            >
                {children}
            </DashboardLayout>
        </SidebarProvider>
    );
}
