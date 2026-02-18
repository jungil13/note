"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! I'm your NoteApp assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")

        // Simulate bot response
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: getBotResponse(input),
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, botMsg])
        }, 1000)
    }

    const getBotResponse = (text: string) => {
        const lowerText = text.toLowerCase()
        if (lowerText.includes("hello") || lowerText.includes("hi")) return "Hello! Hope you're having a productive day."
        if (lowerText.includes("setting")) return "You can manage your profile, notifications, and privacy in the Settings tab."
        if (lowerText.includes("music")) return "Our Music Explorer lets you stream Spotify tracks directly. Check it out in the Music tab!"
        if (lowerText.includes("todo") || lowerText.includes("task")) return "Manage your daily tasks in the Todos section. You can even set due dates!"
        if (lowerText.includes("privacy")) return "We take your privacy seriously. You can find our data controls in Settings > Privacy."
        return "That's interesting! I'm still learning, but I can help you navigate the app if you have questions."
    }

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.div
                className="fixed bottom-24 left-6 z-40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 w-14 rounded-full bg-primary shadow-2xl flex items-center justify-center group"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="open"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="relative"
                            >
                                <MessageCircle className="h-6 w-6" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-primary animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-40 left-6 right-6 md:right-auto md:w-[400px] h-[500px] z-50 rounded-3xl bg-card border shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">NoteApp Assistant</h3>
                                    <div className="flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-full h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted text-foreground rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t bg-muted/30 backdrop-blur-md">
                            <div className="flex gap-2 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-background border rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    size="icon"
                                    className="absolute right-1 top-1 h-8 w-8 rounded-xl bg-primary hover:bg-primary/90 transition-transform active:scale-90"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-60">
                                <Sparkles className="h-2.5 w-2.5" />
                                Powered by NoteApp Intelligence
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
