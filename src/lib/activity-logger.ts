import { prisma } from "@/lib/prisma";

interface LogActivityParams {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
}

export async function logActivity({
    userId,
    action,
    entity,
    entityId,
    description,
    ipAddress,
    userAgent,
}: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                description,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error("Error logging activity:", error);
        // Don't throw - activity logging should not break main operations
    }
}
