import { prisma } from "@/lib/prisma";
import { FiPackage, FiLayers, FiClock, FiCheck } from "react-icons/fi";
import { PageHeader, StatCard, StatGrid } from "@/components/ui/shared";

export default async function AdminDashboard() {
    const [totalBarang, totalStok, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count(),
            prisma.barang.aggregate({ _sum: { stokTotal: true } }),
            prisma.request.count({ where: { status: "PENDING" } }),
            prisma.request.count({ where: { status: "APPROVED" } }),
        ]);

    return (
        <>
            <PageHeader
                title="Dashboard Admin"
                description="Selamat datang di Hanadap Inventory System"
            />

            <StatGrid>
                <StatCard
                    label="Total Barang"
                    value={totalBarang}
                    icon={<FiPackage size={24} />}
                    colorScheme="blue"
                    helpText="Jenis barang terdaftar"
                />
                <StatCard
                    label="Total Stok"
                    value={totalStok._sum.stokTotal || 0}
                    icon={<FiLayers size={24} />}
                    colorScheme="green"
                    helpText="Unit tersedia"
                />
                <StatCard
                    label="Request Pending"
                    value={pendingRequests}
                    icon={<FiClock size={24} />}
                    colorScheme="orange"
                    helpText="Menunggu persetujuan"
                />
                <StatCard
                    label="Request Disetujui"
                    value={approvedRequests}
                    icon={<FiCheck size={24} />}
                    colorScheme="teal"
                    helpText="Total disetujui"
                />
            </StatGrid>
        </>
    );
}
