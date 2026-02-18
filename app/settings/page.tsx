"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Bell, Monitor, User, ChevronDown, CheckCircle2, ShieldCheck, LifeBuoy, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const [notifications, setNotifications] = useState(true)
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    return (
        <main className="min-h-screen p-4 pb-24 space-y-8 bg-background/50 backdrop-blur-3xl">
            <header className="space-y-1">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold tracking-tight text-foreground"
                >
                    Settings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground font-medium"
                >
                    Personalize your experience.
                </motion.p>
            </header>

            <div className="space-y-6">
                {/* Account / Sign in */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-3xl border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" /> Account
                                </h3>
                                <p className="text-sm text-muted-foreground leading-snug">
                                    Sign in to sync notes and tasks and see others&apos; shared content.
                                </p>
                            </div>
                        </div>
                        {status === "loading" ? (
                            <p className="text-sm text-muted-foreground">Loading...</p>
                        ) : session?.user ? (
                            <div className="flex items-center gap-3 flex-wrap">
                                {session.user.image && (
                                    <img
                                        src={session.user.image}
                                        alt=""
                                        className="h-10 w-10 rounded-full"
                                    />
                                )}
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{session.user.name ?? session.user.email}</p>
                                    {session.user.email && (
                                        <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signOut()}
                                    className="shrink-0"
                                >
                                    <LogOut className="h-4 w-4 mr-1" />
                                    Sign out
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => signIn("google")}
                                    className="gap-2"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                                    Sign in with Google
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => signIn("facebook")}
                                    className="gap-2"
                                >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    Sign in with Facebook
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden"
                >
                    <div className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-primary" /> Display Mode
                            </h3>
                            <p className="text-sm text-muted-foreground leading-snug">
                                Switch between light and dark themes.
                            </p>
                        </div>
                        <ModeToggle />
                    </div>
                </motion.div>

                {/* Main Settings Group */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-3xl border bg-card/50 backdrop-blur-xl shadow-xl overflow-hidden divide-y divide-border/50"
                >
                    {/* Notifications Toggle */}
                    <div className="p-5 flex items-center justify-between hover:bg-accent/30 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-base">Real-time Notifications</p>
                                <p className="text-xs text-muted-foreground">Get instant alerts for your tasks</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications ? 'bg-primary' : 'bg-muted'}`}
                        >
                            <motion.div
                                animate={{ x: notifications ? 26 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md flex items-center justify-center"
                            >
                                {notifications && <CheckCircle2 className="h-3 w-3 text-primary" />}
                            </motion.div>
                        </button>
                    </div>

                    {/* Privacy Section */}
                    <div className="flex flex-col">
                        <div
                            onClick={() => toggleSection('privacy')}
                            className="p-5 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-bold text-base">Privacy & Security</p>
                                    <p className="text-xs text-muted-foreground">Manage your data and encryption</p>
                                </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${expandedSection === 'privacy' ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                            {expandedSection === 'privacy' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-muted/20"
                                >
                                    <div className="p-6 pt-0 space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                            <p className="text-sm font-semibold text-primary mb-1">Data Encryption</p>
                                            <p className="text-xs text-muted-foreground">All your notes and tasks are encrypted using industry-standard AES-256 protocols before being synchronized.</p>
                                        </div>
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                            <p className="text-sm font-semibold text-primary mb-1">Privacy Guarantee</p>
                                            <p className="text-xs text-muted-foreground">We never sell your data. Your organizational patterns are yours alone, used only to improve your local experience.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Help & Support Section */}
                    <div className="flex flex-col">
                        <div
                            onClick={() => toggleSection('help')}
                            className="p-5 flex items-center justify-between hover:bg-accent/30 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <LifeBuoy className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-base">Help & Support</p>
                                    <p className="text-xs text-muted-foreground">FAQs and direct assistance</p>
                                </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${expandedSection === 'help' ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                            {expandedSection === 'help' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-muted/20"
                                >
                                    <div className="p-6 pt-0 space-y-4 text-sm">
                                        <p className="font-medium">Frequently Asked Questions:</p>
                                        <ul className="space-y-3">
                                            <li className="flex gap-2">
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                                <p><span className="font-bold">Syncing Issues?</span> Make sure you're connected to the internet and haven't blocked background data.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                                                <p><span className="font-bold">Spotify Playback?</span> Ensure your Spotify account is connected in the Music tab for full playback.</p>
                                            </li>
                                        </ul>
                                        <Button className="w-full rounded-2xl font-bold py-6 group">
                                            Reach Out to Support
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <Separator className="opacity-50" />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center space-y-2 pt-4 bg-gradient-to-b from-transparent to-primary/5 rounded-3xl p-6"
                >
                    <p className="text-sm font-medium">Developed by</p>
                    <p className="text-lg font-semibold text-primary">Jun Gil Casquejo</p>
                    <p className="text-xs text-muted-foreground">Note & Organizer App v1.0.0</p>
                </motion.div>
            </div>
        </main>
    )
}
