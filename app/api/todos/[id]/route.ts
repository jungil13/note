import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureUser } from "@/lib/ensure-user"
import { prisma } from "@/lib/prisma"

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
    const existing = await prisma.todo.findFirst({
        where: { id, userId: user.id },
    })
    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    const body = await req.json()
    const updates: { completed?: boolean; text?: string; dueDate?: number | null } = {}
    if (body.completed !== undefined) updates.completed = Boolean(body.completed)
    if (body.text !== undefined) updates.text = String(body.text)
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate == null ? null : Number(body.dueDate)
    const todo = await prisma.todo.update({
        where: { id },
        data: updates,
    })
    return NextResponse.json({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        dueDate: todo.dueDate ?? undefined,
        createdAt: todo.createdAt,
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
    await prisma.todo.deleteMany({
        where: { id, userId: user.id },
    })
    return NextResponse.json({ ok: true })
}
