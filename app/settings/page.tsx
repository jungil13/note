import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Bell, HelpCircle, Lock, Monitor, Smartphone, User } from "lucide-react"

export default function SettingsPage() {
    return (
        <main className="min-h-screen p-4 pb-24 space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences.</p>
            </header>

            <div className="space-y-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-primary" /> Appearance
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Customize the look and feel.
                            </p>
                        </div>
                        <ModeToggle />
                    </div>
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Account</p>
                                <p className="text-xs text-muted-foreground">Manage your profile</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="p-4 flex items-center justify-between border-b hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Notifications</p>
                                <p className="text-xs text-muted-foreground">Configure alerts</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="p-4 flex items-center justify-between border-b hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Privacy</p>
                                <p className="text-xs text-muted-foreground">Data controls</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <HelpCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Help & Support</p>
                                <p className="text-xs text-muted-foreground">Get assistance</p>
                            </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                <Separator />

                <div className="text-center space-y-2 pt-4">
                    <p className="text-sm font-medium">Developed by</p>
                    <p className="text-lg font-semibold text-primary">Jun Gil Casquejo</p>
                    <p className="text-xs text-muted-foreground">Note & Organizer App v1.0.0</p>
                </div>
            </div>
        </main>
    )
}
