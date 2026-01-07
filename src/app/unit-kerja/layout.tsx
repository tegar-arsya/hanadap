"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./layout.module.css";

const unitKerjaMenus = [
    { href: "/unit-kerja", label: "Dashboard", icon: "📊" },
    { href: "/unit-kerja/stok", label: "Lihat Stok", icon: "📦" },
    { href: "/unit-kerja/request", label: "Ajukan Permintaan", icon: "📝" },
    { href: "/unit-kerja/tracking", label: "Tracking", icon: "🔍" },
    { href: "/unit-kerja/return", label: "Pengembalian", icon: "↩️" },
];

export default function UnitKerjaLayout({
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
                    <span className={styles.badge}>Unit Kerja</span>
                </div>

                <nav className={styles.nav}>
                    {unitKerjaMenus.map((menu) => (
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
                        <span className={styles.userRole}>Unit Kerja</span>
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
