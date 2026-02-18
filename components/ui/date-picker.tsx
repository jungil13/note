"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import "react-day-picker/dist/style.css"

export function DatePicker({
    date,
    setDate,
}: {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "h-9 px-3 w-auto justify-between text-left font-normal border-border/40 text-sm rounded-md shadow-sm",
                        !date && "text-muted-foreground"
                    )}
                >
                    <span className="mr-8">{date ? format(date, "M/d/yyyy") : "Select date"}</span>
                    <CalendarIcon className="h-3 w-3 opacity-30" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-xl overflow-hidden rounded-xl bg-white">
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-3"
                    components={{
                        Chevron: ({ ...props }) => {
                            if (props.orientation === 'left') return <ChevronLeft className="h-4 w-4" />
                            return <ChevronRight className="h-4 w-4" />
                        }
                    }}
                    classNames={{
                        months: "flex flex-col sm:flex-row",
                        month: "space-y-4",
                        month_caption: "flex justify-between py-2 mb-4 relative items-center px-2",
                        caption_label: "text-sm font-medium text-[#333]",
                        nav: "space-x-1 flex items-center",
                        button_previous: cn(
                            "h-7 w-7 bg-transparent p-0 opacity-40 hover:opacity-100 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
                        ),
                        button_next: cn(
                            "h-7 w-7 bg-transparent p-0 opacity-40 hover:opacity-100 flex items-center justify-center hover:bg-accent rounded-full transition-colors"
                        ),
                        month_grid: "w-full border-collapse",
                        weekdays: "flex mb-4",
                        weekday: "text-[#333] w-9 font-medium text-[0.85rem] text-center",
                        week: "flex w-full mt-0",
                        day: cn(
                            "h-9 w-9 p-0 font-normal text-[#333] aria-selected:opacity-100 hover:bg-accent flex items-center justify-center transition-all rounded-full"
                        ),
                        selected:
                            "!border-2 !border-[#0066cc] !text-[#0066cc] !bg-transparent hover:!bg-transparent hover:!text-[#0066cc] focus:!bg-transparent focus:!text-[#0066cc] rounded-full font-semibold",
                        today: "text-[#0066cc] font-bold",
                        outside: "text-[#ccc] opacity-100",
                        disabled: "text-muted-foreground opacity-50",
                        range_middle:
                            "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        hidden: "invisible",
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
    )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
    )
}
