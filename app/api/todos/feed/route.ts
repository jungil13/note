import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Sign in required" }, { status: 401 })
    }
    const todos = await prisma.todo.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } },
        },
    })
    const body = todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        dueDate: t.dueDate ?? undefined,
        createdAt: t.createdAt,
        userId: t.userId,
        userName: t.user.name,
        userEmail: t.user.email,
        userImage: t.user.image,
    }))
    return NextResponse.json(body)
}
