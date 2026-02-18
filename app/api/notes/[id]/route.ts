import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureUser } from "@/lib/ensure-user"
import { prisma } from "@/lib/prisma"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const { id } = await params
    const note = await prisma.note.findFirst({
        where: { id },
        include: { user: { select: { id: true, name: true, image: true } } },
    })
    if (!note) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: JSON.parse(note.tags || "[]") as string[],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        userId: note.userId,
        userName: note.user?.name,
        userImage: note.user?.image,
    })
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const user = await ensureUser(session)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    const { id } = await params
    const existing = await prisma.note.findFirst({
        where: { id, userId: user.id },
    })
    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const body = await req.json()
    const updates: { title?: string; content?: string; tags?: string; updatedAt: number } = {
        updatedAt: Date.now(),
    }
    if (body.title !== undefined) updates.title = String(body.title)
    if (body.content !== undefined) updates.content = String(body.content)
    if (body.tags !== undefined) updates.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : [])
    const note = await prisma.note.update({
        where: { id },
        data: updates,
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

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const user = await ensureUser(session)
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    const { id } = await params
    await prisma.note.deleteMany({
        where: { id, userId: user.id },
    })
    return NextResponse.json({ ok: true })
}
