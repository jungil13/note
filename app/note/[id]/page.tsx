"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotes } from "@/hooks/use-notes"
import { cn } from "@/lib/utils"

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { data: session } = useSession()
    const { id } = use(params)

    const { getNote, addNote, updateNote, deleteNote, isLoaded } = useNotes()

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [authorName, setAuthorName] = useState<string | null>(null)
    const [fetching, setFetching] = useState(false)

    useEffect(() => {
        if (!isLoaded || id === "new") return
        const note = getNote(id)
        if (note) {
            setTitle(note.title)
            setContent(note.content)
            setTags(note.tags)
            setIsReadOnly(false)
            return
        }
        if (session?.user) {
            setFetching(true)
            fetch(`/api/notes/${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Not found")
                    return res.json()
                })
                .then((data: { title: string; content: string; tags: string[]; userId?: string; userName?: string }) => {
                    setTitle(data.title)
                    setContent(data.content)
                    setTags(data.tags ?? [])
                    setIsReadOnly(data.userId !== session?.user?.id)
                    setAuthorName(data.userName ?? null)
                })
                .catch(() => router.push("/"))
                .finally(() => setFetching(false))
            return
        }
        router.push("/")
    }, [id, isLoaded, getNote, router, session?.user?.id])

    const handleSave = async () => {
        if (id === "new") {
            await addNote({ title, content, tags })
        } else {
            await updateNote(id, { title, content, tags })
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

    if (!isLoaded && id !== "new") return null
    if (id !== "new" && fetching) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </main>
        )
    }

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
                    {authorName && (
                        <span className="text-sm text-muted-foreground">by {authorName}</span>
                    )}
                    {!isReadOnly && id !== "new" && (
                        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    )}
                    {!isReadOnly && (
                        <Button onClick={handleSave} size="sm">
                            Save
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => !isReadOnly && setTitle(e.target.value)}
                    readOnly={isReadOnly}
                    className={cn(
                        "w-full bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus:outline-none",
                        isReadOnly && "cursor-default"
                    )}
                />

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-sm text-secondary-foreground"
                        >
                            #{tag}
                            {!isReadOnly && (
                                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
                            )}
                        </span>
                    ))}
                    {!isReadOnly && (
                        <input
                            type="text"
                            placeholder="#Add tags..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="bg-transparent text-sm text-muted-foreground focus:outline-none min-w-[80px]"
                        />
                    )}
                </div>

                <textarea
                    placeholder="Start typing..."
                    value={content}
                    onChange={(e) => !isReadOnly && setContent(e.target.value)}
                    readOnly={isReadOnly}
                    className={cn(
                        "h-full w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none",
                        isReadOnly && "cursor-default"
                    )}
                    style={{ minHeight: "50vh" }}
                />
            </div>
        </motion.main>
    )
}
