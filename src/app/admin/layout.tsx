"use client";

import {
    FiHome,
    FiPackage,
    FiCamera,
    FiUpload,
    FiClipboard,
    FiUsers,
    FiTag,
    FiGrid,
    FiSettings,
    FiActivity,
    FiFileText,
    FiUser,
} from "react-icons/fi";
import { SidebarProvider, DashboardLayout } from "@/components/ui/sidebar";

const adminMenus = [
    { href: "/admin", label: "Dashboard", icon: FiHome },
    { href: "/admin/stok", label: "Kelola Stok", icon: FiPackage },
    { href: "/admin/scan", label: "Scan Barcode", icon: FiCamera },
    { href: "/admin/import", label: "Import Data", icon: FiUpload },
    { href: "/admin/request", label: "Permintaan", icon: FiClipboard },
    { href: "/admin/users", label: "Manajemen User", icon: FiUsers },
    { href: "/admin/kategori", label: "Kategori", icon: FiTag },
    { href: "/admin/unit-kerja", label: "Unit Kerja", icon: FiGrid },
    { href: "/admin/approval", label: "Config Approval", icon: FiSettings, hidden: true },
    { href: "/admin/activity", label: "Activity Log", icon: FiActivity },
    { href: "/admin/laporan", label: "Laporan", icon: FiFileText },
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
