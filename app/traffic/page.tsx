"use client"

import { TrafficTracker } from "@/components/traffic-tracker"
import { TrafficMap } from "@/components/traffic-map"
import { motion } from "framer-motion"
import { useState } from "react"

export default function TrafficPage() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    return (
        <main className="min-h-screen p-4 pb-24 bg-background/50 backdrop-blur-3xl">
            <header className="space-y-1 mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-bold tracking-tight text-foreground"
                >
                    Traffic Explorer
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground font-medium"
                >
                    Real-time road conditions and interactive incident map.
                </motion.p>
            </header>

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <TrafficMap center={location || undefined} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <TrafficTracker onLocationDetected={(coords) => setLocation(coords)} />
                </motion.div>
            </div>
        </main>
    )
}
