"use client"

import { useEffect, useState } from "react"

export type Note = {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: number
    updatedAt: number
}

const STORAGE_KEY = "note-app-data"

export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                // eslint-disable-next-line
                setNotes(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse notes", e)
            }
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
        }
    }, [notes, isLoaded])

    const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
        const newNote: Note = {
            ...note,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        }
        setNotes((prev) => [newNote, ...prev])
        return newNote.id
    }

    const updateNote = (id: string, updates: Partial<Omit<Note, "id" | "createdAt">>) => {
        setNotes((prev) =>
            prev.map((note) =>
                note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note
            )
        )
    }

    const deleteNote = (id: string) => {
        setNotes((prev) => prev.filter((note) => note.id !== id))
    }

    const getNote = (id: string) => notes.find((n) => n.id === id)

    return { notes, addNote, updateNote, deleteNote, getNote, isLoaded }
}
