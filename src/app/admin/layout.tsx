"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

const adminMenus = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/stok", label: "Kelola Stok", icon: "📦" },
    { href: "/admin/scan", label: "Scan Barcode", icon: "📷" },
    { href: "/admin/request", label: "Permintaan", icon: "📋" },
    { href: "/admin/users", label: "Manajemen User", icon: "👥" },
    { href: "/admin/kategori", label: "Kategori", icon: "🏷️" },
    { href: "/admin/unit-kerja", label: "Unit Kerja", icon: "🏢" },
    { href: "/admin/approval", label: "Konfigurasi Approval", icon: "⚙️" },
    { href: "/admin/activity", label: "Activity Log", icon: "📜" },
    { href: "/admin/laporan", label: "Laporan", icon: "📄" },
    { href: "/profil", label: "Profil Saya", icon: "👤" },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h1>Hanadap</h1>
                    <span className={styles.badge}>Admin</span>
                </div>

                <nav className={styles.nav}>
                    {adminMenus.map((menu) => (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`${styles.navLink} ${pathname === menu.href ? styles.active : ""
                                }`}
                        >
                            <span className={styles.icon}>{menu.icon}</span>
                            {menu.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.user}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{session?.user?.name}</span>
                        <span className={styles.userRole}>Admin</span>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={styles.logout}
                    >
                        Keluar
                    </button>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
