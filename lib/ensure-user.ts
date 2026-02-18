import type { Session } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function ensureUser(session: Session) {
    const id = session.user?.id
    if (!id) return null
    const user = await prisma.user.upsert({
        where: { id },
        create: {
            id,
            email: session.user?.email ?? null,
            name: session.user?.name ?? null,
            image: session.user?.image ?? null,
        },
        update: {
            email: session.user?.email ?? undefined,
            name: session.user?.name ?? undefined,
            image: session.user?.image ?? undefined,
        },
    })
    return user
}
