"use client"

import { useEffect, useState } from "react"

export type Todo = {
    id: string
    text: string
    completed: boolean
    dueDate?: number
    createdAt: number
}

const STORAGE_KEY = "todo-app-data"

export function useTodos() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                // eslint-disable-next-line
                setTodos(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse todos", e)
            }
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
        }
    }, [todos, isLoaded])

    const addTodo = (text: string, dueDate?: Date) => {
        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            completed: false,
            dueDate: dueDate ? dueDate.getTime() : undefined,
            createdAt: Date.now(),
        }
        setTodos((prev) => [newTodo, ...prev])
    }

    const toggleTodo = (id: string) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        )
    }

    const deleteTodo = (id: string) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
    }

    return { todos, addTodo, toggleTodo, deleteTodo, isLoaded }
}
