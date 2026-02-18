"use client"

import Link from "next/link"
import { Plus, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { useNotes, useNotesFeed } from "@/hooks/use-notes"
import { NoteCard } from "@/components/note-card"
import { Input } from "@/components/ui/input"

export default function Home() {
  const { data: session } = useSession()
  const { notes, isLoaded } = useNotes()
  const { feed: feedNotes, isLoaded: feedLoaded } = useNotesFeed()
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"mine" | "others">("mine")

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredFeed = feedNotes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  if (!isLoaded) {
    return null
  }

  return (
    <main className="min-h-screen p-4 pb-24 space-y-4">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts</p>
        </div>
      </header>

      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 space-y-3">
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        {session?.user && (
          <div className="flex gap-2">
            <Button
              variant={tab === "mine" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("mine")}
            >
              My notes
            </Button>
            <Button
              variant={tab === "others" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("others")}
              className="gap-1"
            >
              <Users className="h-4 w-4" />
              From others
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tab === "mine" &&
          filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        {tab === "others" && session?.user && (
          feedLoaded ? (
            filteredFeed.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                authorName={note.userName ?? note.userEmail ?? "Someone"}
                authorImage={note.userImage}
              />
            ))
          ) : (
            <p className="col-span-full text-sm text-muted-foreground">Loading feed...</p>
          )
        )}
      </div>

      {(tab === "mine" && filteredNotes.length === 0) && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground mt-20 col-span-full">
          <p>No notes found.</p>
          <p className="text-sm">Tap the + button to create one.</p>
        </div>
      )}

      {tab === "others" && session?.user && feedLoaded && filteredFeed.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground mt-20 col-span-full">
          <p>No notes from others yet.</p>
          <p className="text-sm">Notes from all signed-in users will appear here.</p>
        </div>
      )}

      <Link href="/note/new">
        <motion.div
          className="fixed bottom-20 right-4 z-40"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </Link>
    </main>
  );
}
