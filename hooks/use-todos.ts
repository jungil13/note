"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

export type Todo = {
    id: string
    text: string
    completed: boolean
    dueDate?: number
    createdAt: number
}

export type TodoFeedItem = Todo & {
    userId?: string
    userName?: string | null
    userEmail?: string | null
    userImage?: string | null
}

const STORAGE_KEY = "todo-app-data"

export function useTodos() {
    const { data: session, status } = useSession()
    const [todos, setTodos] = useState<Todo[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (status === "loading") return
        if (session?.user) {
            fetch("/api/todos")
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch")
                    return res.json()
                })
                .then((data: Todo[]) => setTodos(Array.isArray(data) ? data : []))
                .catch(() => setTodos([]))
                .finally(() => setIsLoaded(true))
            return
        }
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                setTodos(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse todos", e)
            }
        }
        setIsLoaded(true)
    }, [session?.user, status])

    useEffect(() => {
        if (!isLoaded || session?.user) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }, [todos, isLoaded, session?.user])

    const addTodo = useCallback(
        async (text: string, dueDate?: Date) => {
            const payload = {
                text,
                dueDate: dueDate ? dueDate.getTime() : undefined,
            }
            if (session?.user) {
                const res = await fetch("/api/todos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!res.ok) throw new Error("Failed to create todo")
                const newTodo: Todo = await res.json()
                setTodos((prev) => [newTodo, ...prev])
                return
            }
            const newTodo: Todo = {
                id: crypto.randomUUID(),
                text,
                completed: false,
                dueDate: dueDate ? dueDate.getTime() : undefined,
                createdAt: Date.now(),
            }
            setTodos((prev) => [newTodo, ...prev])
        },
        [session?.user]
    )

    const toggleTodo = useCallback(
        async (id: string) => {
            const todo = todos.find((t) => t.id === id)
            if (!todo) return
            if (session?.user) {
                const res = await fetch(`/api/todos/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ completed: !todo.completed }),
                })
                if (!res.ok) throw new Error("Failed to update todo")
                const updated: Todo = await res.json()
                setTodos((prev) =>
                    prev.map((t) => (t.id === id ? updated : t))
                )
                return
            }
            setTodos((prev) =>
                prev.map((t) =>
                    t.id === id ? { ...t, completed: !t.completed } : t
                )
            )
        },
        [session?.user, todos]
    )

    const deleteTodo = useCallback(
        async (id: string) => {
            if (session?.user) {
                const res = await fetch(`/api/todos/${id}`, { method: "DELETE" })
                if (!res.ok) throw new Error("Failed to delete todo")
            }
            setTodos((prev) => prev.filter((t) => t.id !== id))
        },
        [session?.user]
    )

    return { todos, addTodo, toggleTodo, deleteTodo, isLoaded }
}

export function useTodosFeed() {
    const { data: session, status } = useSession()
    const [feed, setFeed] = useState<TodoFeedItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (status === "loading" || !session?.user) {
            setIsLoaded(true)
            setFeed([])
            return
        }
        fetch("/api/todos/feed")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch feed")
                return res.json()
            })
            .then((data: TodoFeedItem[]) => setFeed(Array.isArray(data) ? data : []))
            .catch(() => setFeed([]))
            .finally(() => setIsLoaded(true))
    }, [session?.user, status])

    return { feed, isLoaded }
}
