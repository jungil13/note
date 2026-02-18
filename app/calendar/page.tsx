"use client"

import { useState } from "react"
import { format, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNotes } from "@/hooks/use-notes"
import { useTodos } from "@/hooks/use-todos"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
    const { notes, isLoaded: notesLoaded } = useNotes()
    const { todos, isLoaded: todosLoaded } = useTodos()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    if (!notesLoaded || !todosLoaded) return null

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Create calendar grid
    const calendarDays = []
    const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7

    for (let i = 0; i < totalSlots; i++) {
        const dayNumber = i - firstDay + 1
        if (dayNumber > 0 && dayNumber <= daysInMonth) {
            calendarDays.push(dayNumber)
        } else {
            calendarDays.push(null)
        }
    }

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(year, month, day)
        setSelectedDate(clickedDate)
    }

    // Check if a date has todos or notes
    const hasEventsOnDate = (day: number) => {
        const date = new Date(year, month, day)
        const hasTodos = todos.some(t => t.dueDate && isSameDay(new Date(t.dueDate), date))
        const hasNotes = notes.some(n => isSameDay(new Date(n.updatedAt), date))
        return { hasTodos, hasNotes }
    }

    // Get selected date's events
    const selectedTodos = selectedDate
        ? todos.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), selectedDate))
        : []

    const selectedNotes = selectedDate
        ? notes.filter((n) => isSameDay(new Date(n.updatedAt), selectedDate))
        : []

    const monthName = format(currentDate, "MMMM")
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

    return (
        <main className="min-h-screen pb-24 bg-background p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 md:gap-6">
                    {/* Calendar Section */}
                    <div className="bg-card border rounded-lg p-4 md:p-8 shadow-sm">
                        {/* Header with Month Name and Year */}
                        <div className="flex items-center justify-between mb-6 md:mb-8 flex-wrap gap-4">
                            <div className="flex items-center gap-2 md:gap-4">
                                <button
                                    onClick={goToPreviousMonth}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <h1 className="text-3xl md:text-5xl font-playfair italic text-foreground/80">
                                    {monthName}
                                </h1>
                                <button
                                    onClick={goToNextMonth}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="text-2xl md:text-4xl font-light text-muted-foreground">
                                {year}
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="border border-border overflow-hidden rounded-lg">
                            {/* Week Day Headers */}
                            <div className="grid grid-cols-7 border-b border-border">
                                {weekDays.map((day) => (
                                    <div
                                        key={day}
                                        className="text-center py-2 md:py-3 text-[10px] md:text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0 bg-muted/30"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7">
                                {calendarDays.map((day, index) => {
                                    const events = day ? hasEventsOnDate(day) : { hasTodos: false, hasNotes: false }
                                    const isSelected = day && selectedDate && isSameDay(new Date(year, month, day), selectedDate)
                                    const isToday = day && isSameDay(new Date(year, month, day), new Date())

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => day && handleDateClick(day)}
                                            className={cn(
                                                "min-h-[60px] md:min-h-[100px] border-r border-b border-border last:border-r-0 p-2 relative transition-colors",
                                                index >= calendarDays.length - 7 && "border-b-0",
                                                !day && "bg-muted/10",
                                                day && "cursor-pointer hover:bg-accent/50",
                                                isSelected && "bg-primary/10 ring-2 ring-primary ring-inset",
                                                isToday && "bg-accent"
                                            )}
                                        >
                                            {day && (
                                                <>
                                                    <div className={cn(
                                                        "text-xs md:text-sm font-normal",
                                                        isSelected && "font-semibold text-primary"
                                                    )}>
                                                        {day}
                                                    </div>
                                                    {/* Event Indicators */}
                                                    {(events.hasTodos || events.hasNotes) && (
                                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                                            {events.hasTodos && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            )}
                                                            {events.hasNotes && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Selected Date Info - Mobile Only */}
                        {selectedDate && (selectedTodos.length > 0 || selectedNotes.length > 0) && (
                            <div className="lg:hidden mt-6 space-y-4">
                                <h2 className="text-lg font-semibold">
                                    {format(selectedDate, "MMMM do, yyyy")}
                                </h2>

                                {selectedTodos.length > 0 && (
                                    <div className="bg-card border rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                                            Tasks ({selectedTodos.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {selectedTodos.map((todo) => (
                                                <div key={todo.id} className="flex items-start gap-2 py-1">
                                                    <div className={cn(
                                                        "mt-1 h-3 w-3 rounded-sm border-2 flex-shrink-0",
                                                        todo.completed ? "bg-foreground border-foreground" : "border-muted-foreground"
                                                    )} />
                                                    <span className={cn(
                                                        "text-sm",
                                                        todo.completed && "line-through text-muted-foreground"
                                                    )}>
                                                        {todo.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedNotes.length > 0 && (
                                    <div className="bg-card border rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                                            Notes ({selectedNotes.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedNotes.map((note) => (
                                                <div key={note.id} className="pb-3 border-b border-border/50 last:border-b-0">
                                                    <h4 className="text-sm font-medium mb-1">{note.title}</h4>
                                                    {note.content && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {note.content}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Section - Desktop Only */}
                    <div className="hidden lg:block space-y-6">
                        {selectedDate && (
                            <div className="bg-card border rounded-lg p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-center mb-2">
                                    {format(selectedDate, "MMMM do, yyyy")}
                                </h2>
                                {isSameDay(selectedDate, new Date()) && (
                                    <div className="text-xs text-center text-primary font-medium">Today</div>
                                )}
                            </div>
                        )}

                        {/* TO DO LIST */}
                        <div className="bg-card border rounded-lg shadow-sm">
                            <div className="bg-muted/50 px-4 py-3 border-b">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {selectedDate ? `TASKS (${selectedTodos.length})` : 'ALL TASKS'}
                                </h2>
                            </div>
                            <div className="p-4 space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                                {(selectedDate ? selectedTodos : todos.slice(0, 8)).map((todo) => (
                                    <div key={todo.id} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-b-0">
                                        <div className={cn(
                                            "mt-1 h-3 w-3 rounded-sm border-2 flex-shrink-0",
                                            todo.completed ? "bg-foreground border-foreground" : "border-muted-foreground"
                                        )} />
                                        <span className={cn(
                                            "text-sm",
                                            todo.completed && "line-through text-muted-foreground"
                                        )}>
                                            {todo.text}
                                        </span>
                                    </div>
                                ))}
                                {(selectedDate ? selectedTodos : todos).length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">
                                        No tasks{selectedDate ? ' for this date' : ''}...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* NOTES */}
                        <div className="bg-card border rounded-lg shadow-sm">
                            <div className="bg-muted/50 px-4 py-3 border-b">
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {selectedDate ? `NOTES (${selectedNotes.length})` : 'RECENT NOTES'}
                                </h2>
                            </div>
                            <div className="p-4 space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                                {(selectedDate ? selectedNotes : notes.slice(0, 5)).map((note) => (
                                    <div key={note.id} className="pb-3 border-b border-border/50 last:border-b-0">
                                        <h3 className="text-sm font-medium mb-1">{note.title}</h3>
                                        {note.content && (
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {note.content}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                {(selectedDate ? selectedNotes : notes).length === 0 && (
                                    <div className="text-sm text-muted-foreground italic">
                                        No notes{selectedDate ? ' for this date' : ''}...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
