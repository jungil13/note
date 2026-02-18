"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useTodos } from "@/hooks/use-todos"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"

export default function TodosPage() {
    const { todos, addTodo, toggleTodo, deleteTodo, isLoaded } = useTodos()
    const [newTodo, setNewTodo] = useState("")
    const [date, setDate] = useState<Date>()

    const handleAdd = () => {
        if (newTodo.trim()) {
            addTodo(newTodo.trim(), date)
            setNewTodo("")
            setDate(undefined)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAdd()
        }
    }

    if (!isLoaded) return null

    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed === b.completed) return b.createdAt - a.createdAt
        return a.completed ? 1 : -1
    })

    return (
        <main className="min-h-screen p-4 pb-24 space-y-4">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
                    <p className="text-muted-foreground">Stay organized</p>
                </div>
            </header>

            <div className="flex gap-2">
                <Input
                    placeholder="Add a new task..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <DatePicker date={date} setDate={setDate} />
                <Button onClick={handleAdd}>Add</Button>
            </div>

            <div className="space-y-2 mt-6">
                <AnimatePresence initial={false}>
                    {sortedTodos.map((todo) => (
                        <motion.div
                            key={todo.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                                "group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50",
                                todo.completed && "bg-muted/30"
                            )}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Checkbox
                                    checked={todo.completed}
                                    onCheckedChange={() => toggleTodo(todo.id)}
                                />
                                <div className="flex flex-col overflow-hidden">
                                    <span
                                        className={cn(
                                            "truncate font-medium transition-all",
                                            todo.completed && "text-muted-foreground line-through"
                                        )}
                                    >
                                        {todo.text}
                                    </span>
                                    {todo.dueDate && (
                                        <span className="flex items-center text-xs text-muted-foreground">
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            {format(todo.dueDate, "PPP")}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {todos.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No tasks yet. Add one above!</p>
                    </div>
                )}
            </div>
        </main>
    )
}
