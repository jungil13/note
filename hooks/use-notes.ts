"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

export type Note = {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: number
    updatedAt: number
}

export type NoteFeedItem = Note & {
    userId?: string
    userName?: string | null
    userEmail?: string | null
    userImage?: string | null
}

const STORAGE_KEY = "note-app-data"

export function useNotes() {
    const { data: session, status } = useSession()
    const [notes, setNotes] = useState<Note[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from API when signed in
    useEffect(() => {
        if (status === "loading") return
        if (session?.user) {
            fetch("/api/notes")
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch")
                    return res.json()
                })
                .then((data: Note[]) => setNotes(Array.isArray(data) ? data : []))
                .catch(() => setNotes([]))
                .finally(() => setIsLoaded(true))
            return
        }
        // LocalStorage when not signed in
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                setNotes(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse notes", e)
            }
        }
        setIsLoaded(true)
    }, [session?.user, status])

    // Persist to localStorage when not signed in
    useEffect(() => {
        if (!isLoaded || session?.user) return
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }, [notes, isLoaded, session?.user])

    const addNote = useCallback(
        async (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
            if (session?.user) {
                const res = await fetch("/api/notes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(note),
                })
                if (!res.ok) throw new Error("Failed to create note")
                const newNote: Note = await res.json()
                setNotes((prev) => [newNote, ...prev])
                return newNote.id
            }
            const newNote: Note = {
                ...note,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
            setNotes((prev) => [newNote, ...prev])
            return newNote.id
        },
        [session?.user]
    )

    const updateNote = useCallback(
        async (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
            if (session?.user) {
                const res = await fetch(`/api/notes/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                })
                if (!res.ok) throw new Error("Failed to update note")
                const updated: Note = await res.json()
                setNotes((prev) =>
                    prev.map((n) => (n.id === id ? updated : n))
                )
                return
            }
            setNotes((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
                )
            )
        },
        [session?.user]
    )

    const deleteNote = useCallback(
        async (id: string) => {
            if (session?.user) {
                const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
                if (!res.ok) throw new Error("Failed to delete note")
            }
            setNotes((prev) => prev.filter((n) => n.id !== id))
        },
        [session?.user]
    )

    const getNote = useCallback(
        (id: string) => notes.find((n) => n.id === id),
        [notes]
    )

    return { notes, addNote, updateNote, deleteNote, getNote, isLoaded }
}

export function useNotesFeed() {
    const { data: session, status } = useSession()
    const [feed, setFeed] = useState<NoteFeedItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        if (status === "loading" || !session?.user) {
            setIsLoaded(true)
            setFeed([])
            return
        }
        fetch("/api/notes/feed")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch feed")
                return res.json()
            })
            .then((data: NoteFeedItem[]) => setFeed(Array.isArray(data) ? data : []))
            .catch(() => setFeed([]))
            .finally(() => setIsLoaded(true))
    }, [session?.user, status])

    return { feed, isLoaded }
}
