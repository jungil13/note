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
    const todos = await prisma.todo.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
    })
    const body = todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        dueDate: t.dueDate ?? undefined,
        createdAt: t.createdAt,
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
    const { text = "", dueDate } = body
    const now = Date.now()
    const todo = await prisma.todo.create({
        data: {
            userId: user.id,
            text: String(text),
            completed: false,
            dueDate: dueDate != null ? Number(dueDate) : null,
            createdAt: now,
        },
    })
    return NextResponse.json({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        dueDate: todo.dueDate ?? undefined,
        createdAt: todo.createdAt,
    })
}
