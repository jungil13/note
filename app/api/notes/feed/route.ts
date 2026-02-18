import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const notes = await prisma.note.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } },
        },
    })
    const body = notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tags: JSON.parse(n.tags || "[]") as string[],
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        userId: n.userId,
        userName: n.user.name,
        userEmail: n.user.email,
        userImage: n.user.image,
    }))
    return NextResponse.json(body)
}
