"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, CheckSquare, Settings, StickyNote, Music2 } from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
    {
        href: "/",
        icon: StickyNote,
        label: "Notes",
    },
    {
        href: "/todos",
        icon: CheckSquare,
        label: "Todos",
    },
    {
        href: "/calendar",
        icon: Calendar,
        label: "Calendar",
    },
    {
        href: "/music",
        icon: Music2,
        label: "Music",
    },
    {
        href: "/settings",
        icon: Settings,
        label: "Settings",
    },
]

export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 backdrop-blur-lg">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center space-y-1 text-muted-foreground transition-colors hover:text-primary",
                            isActive && "text-primary"
                        )}
                    >
                        <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
