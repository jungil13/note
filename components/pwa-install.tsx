"use client"

import { useState, useEffect } from "react"
import { Download, X, Smartphone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function InstallPWA() {
    const [installPrompt, setInstallPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsStandalone(true)
            return
        }

        const handler = (e: any) => {
            e.preventDefault()
            setInstallPrompt(e)
            // Show prompt after a short delay
            setTimeout(() => setIsVisible(true), 3000)
        }

        window.addEventListener("beforeinstallprompt", handler)

        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleInstall = async () => {
        if (!installPrompt) return

        installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice

        if (outcome === "accepted") {
            setIsVisible(false)
        }
        setInstallPrompt(null)
    }

    if (isStandalone || !isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-50"
            >
                <div className="bg-card/95 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl p-5 overflow-hidden relative group">
                    {/* Background Glow */}
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 blur-3xl rounded-full" />

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="flex gap-4 items-start">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <Smartphone className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 pr-6">
                            <h3 className="font-bold text-lg tracking-tight">Experience NoteApp</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                Install our app for the full mobile experience, offline access, and faster performance.
                            </p>

                            <div className="flex items-center gap-2 mt-4">
                                <Button
                                    onClick={handleInstall}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 flex items-center gap-2 h-10"
                                >
                                    <Download className="h-4 w-4" />
                                    Install Now
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsVisible(false)}
                                    className="rounded-full text-xs font-medium"
                                >
                                    Later
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        <Globe className="h-3 w-3" />
                        Progressive Web App Technology
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
