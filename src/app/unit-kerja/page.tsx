import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getStats(userId: string) {
    const [totalBarang, myRequests, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count(),
            prisma.request.count({ where: { userId } }),
            prisma.request.count({ where: { userId, status: "PENDING" } }),
            prisma.request.count({ where: { userId, status: "APPROVED" } }),
        ]);

    return {
        totalBarang,
        myRequests,
        pendingRequests,
        approvedRequests,
    };
}

export default async function UnitKerjaDashboard() {
    const session = await getServerSession(authOptions);
    const stats = await getStats(session?.user?.id || "");

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Dashboard Unit Kerja</h1>
            <p className={styles.subtitle}>
                Selamat datang, {session?.user?.name}
            </p>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📦</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.totalBarang}</span>
                        <span className={styles.statLabel}>Barang Tersedia</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📝</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.myRequests}</span>
                        <span className={styles.statLabel}>Total Permintaan</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⏳</span>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.pendingRequests}</span>
                        <span className={styles.statLabel}>Menunggu</span>
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
