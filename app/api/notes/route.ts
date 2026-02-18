import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureUser } from "@/lib/ensure-user"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const user = await ensureUser(session)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    const notes = await prisma.note.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
    })
    const body = notes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        tags: JSON.parse(n.tags || "[]") as string[],
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
    }))
    return NextResponse.json(body)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const user = await ensureUser(session)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    const body = await req.json()
    const { title = "", content = "", tags = [] } = body
    const now = Date.now()
    const note = await prisma.note.create({
        data: {
            userId: user.id,
            title: String(title),
            content: String(content),
            tags: JSON.stringify(Array.isArray(tags) ? tags : []),
            createdAt: now,
            updatedAt: now,
        },
    })
    return NextResponse.json({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: JSON.parse(note.tags || "[]") as string[],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    })
}
