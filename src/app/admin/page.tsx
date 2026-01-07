import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";

async function getStats() {
    const [totalBarang, totalStok, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count(),
            prisma.barang.aggregate({ _sum: { stokTotal: true } }),
            prisma.request.count({ where: { status: "PENDING" } }),
            prisma.request.count({ where: { status: "APPROVED" } }),
        ]);

    return {
        totalBarang,
        totalStok: totalStok._sum.stokTotal || 0,
        pendingRequests,
        approvedRequests,
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Dashboard Admin</h1>
            <p className={styles.subtitle}>Selamat datang di panel administrasi inventori</p>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📦</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalBarang}</span>
                        <span className={styles.statLabel}>Jenis Barang</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>🔢</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalStok}</span>
                        <span className={styles.statLabel}>Total Stok</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⏳</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.pendingRequests}</span>
                        <span className={styles.statLabel}>Menunggu Approval</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.approvedRequests}</span>
                        <span className={styles.statLabel}>Disetujui</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
