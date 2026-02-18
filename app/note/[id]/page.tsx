"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotes } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    // Unwrap params using React.use()
    const { id } = use(params)

    const { getNote, addNote, updateNote, deleteNote, isLoaded } = useNotes()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")

    useEffect(() => {
        if (isLoaded && id !== "new") {
            const note = getNote(id)
            if (note) {
                // eslint-disable-next-line
                setTitle(note.title)
                // eslint-disable-next-line
                setContent(note.content)
                // eslint-disable-next-line
                setTags(note.tags)
            } else {
                router.push("/")
            }
        }
    }, [id, isLoaded, getNote, router])

    const handleSave = () => {
        if (id === "new") {
            addNote({ title, content, tags })
        } else {
            updateNote(id, { title, content, tags })
        }
        router.back()
    }

    const handleDelete = () => {
        if (id !== "new") {
            deleteNote(id)
        }
        router.back()
    }

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()])
            }
            setTagInput("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    if (!isLoaded) return null

    return (
        <motion.main
            className="min-h-screen flex flex-col bg-background"
            layoutId={id !== "new" ? `note-${id}` : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
        >
            <header className="flex h-16 items-center justify-between border-b px-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    {id !== "new" && (
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                    <Button onClick={handleSave} size="sm">
                        Save
                    </Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                        >
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder="#Add tags..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="bg-transparent text-sm text-muted-foreground focus:outline-none min-w-[80px]"
                    />
                </div>

                <textarea
                    placeholder="Start typing..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-full w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
                    style={{ minHeight: "50vh" }}
                />
            </div>
        </motion.main>
    )
}
