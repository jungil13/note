"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { Note } from "@/hooks/use-notes"

interface NoteCardProps {
    note: Note
}

export function NoteCard({ note }: NoteCardProps) {
    return (
        <Link href={`/note/${note.id}`}>
            <motion.div
                layoutId={`note-${note.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Card className="h-full overflow-hidden transition-colors hover:bg-muted/50">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="line-clamp-1 text-lg">{note.title || "Untitled Note"}</CardTitle>
                        <CardDescription suppressHydrationWarning>
                            {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <p className="line-clamp-4 text-sm text-muted-foreground whitespace-pre-wrap">
                            {note.content || "No content"}
                        </p>
                    </CardContent>
                    {note.tags && note.tags.length > 0 && (
                        <CardFooter className="flex flex-wrap gap-1 p-4 pt-0">
                            {note.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </Link>
    )
}
