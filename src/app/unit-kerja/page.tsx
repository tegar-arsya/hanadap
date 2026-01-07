import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FiPackage, FiClipboard, FiClock, FiCheck } from "react-icons/fi";
import { PageHeader, StatCard, StatGrid } from "@/components/ui/shared";

export default async function UnitKerjaDashboard() {
    const session = await getServerSession(authOptions);

    const [totalBarang, userRequests, pendingRequests, approvedRequests] =
        await Promise.all([
            prisma.barang.count({ where: { stokTotal: { gt: 0 } } }),
            prisma.request.count({ where: { userId: session?.user?.id } }),
            prisma.request.count({
                where: { userId: session?.user?.id, status: "PENDING" },
            }),
            prisma.request.count({
                where: { userId: session?.user?.id, status: "APPROVED" },
            }),
        ]);

    return (
        <>
            <PageHeader
                title="Dashboard Unit Kerja"
                description={`Selamat datang, ${session?.user?.name}`}
            />

            <StatGrid>
                <StatCard
                    label="Barang Tersedia"
                    value={totalBarang}
                    icon={<FiPackage size={24} />}
                    colorScheme="blue"
                    helpText="Barang dengan stok"
                />
                <StatCard
                    label="Total Request"
                    value={userRequests}
                    icon={<FiClipboard size={24} />}
                    colorScheme="purple"
                    helpText="Request Anda"
                />
                <StatCard
                    label="Request Pending"
                    value={pendingRequests}
                    icon={<FiClock size={24} />}
                    colorScheme="orange"
                    helpText="Menunggu approval"
                />
                <StatCard
                    label="Request Disetujui"
                    value={approvedRequests}
                    icon={<FiCheck size={24} />}
                    colorScheme="green"
                    helpText="Sudah disetujui"
                />
            </StatGrid>
        </>
    );
}
