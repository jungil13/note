"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, AlertTriangle, Clock, TrendingUp, RefreshCw, Navigation2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface TrafficIncident {
    id: string
    type: string
    severity: number
    description: string
    delay: number // in seconds
    distance: number // in meters
    lastUpdated: string
}

export function TrafficTracker() {
    const [incidents, setIncidents] = useState<TrafficIncident[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const fetchTrafficData = useCallback(async (lat: number, lng: number) => {
        const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

        if (!apiKey) {
            setError("TomTom API Key is missing. Please add NEXT_PUBLIC_TOMTOM_API_KEY to your .env.local and RESTART your dev server (npm run dev).")
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            // Calculate a simple bounding box
            const offset = 0.1
            const bbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`
            const fields = "{incidents{type,properties{id,magnitudeOfDelay,events{description},iconCategory,length,delay,lastReportTime}}}"

            // Construct URL - using template literal to be absolutely sure about encoding
            const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&fields=${encodeURIComponent(fields)}&language=en-GB`

            const response = await fetch(url)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
                console.error("TomTom API Error Details:", errorData)
                const msg = errorData.detailedError?.message || errorData.error?.message || errorData.message || response.statusText
                throw new Error(`Traffic API error ${response.status}: ${msg}`)
            }

            const data = await response.json()

            // Map TomTom data to our interface
            const mappedIncidents: TrafficIncident[] = (data.incidents || []).map((inc: any) => ({
                id: inc.properties.id,
                type: inc.properties.iconCategory || "Unknown",
                severity: inc.properties.magnitudeOfDelay || 0,
                description: inc.properties.events?.[0]?.description || "Traffic Delay",
                delay: inc.properties.delay || 0,
                distance: inc.properties.length || 0,
                lastUpdated: inc.properties.lastReportTime || new Date().toISOString()
            }))

            setIncidents(mappedIncidents.sort((a, b) => b.severity - a.severity))
            setLastRefresh(new Date())
        } catch (err: any) {
            console.error("Traffic Error:", err)
            setError(err.message || "Unable to load traffic data. Check your API key or connection.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
                    setLocation(coords)
                    fetchTrafficData(coords.lat, coords.lng)
                },
                (err) => {
                    setError("Location access denied. Please enable GPS for traffic data.")
                    setLoading(false)
                }
            )
        } else {
            setError("Geolocation is not supported by your browser.")
            setLoading(false)
        }
    }, [fetchTrafficData])

    // Auto-refresh every 1 minute
    useEffect(() => {
        if (!location) return
        const interval = setInterval(() => {
            fetchTrafficData(location.lat, location.lng)
        }, 60000)
        return () => clearInterval(interval)
    }, [location, fetchTrafficData])

    const getSeverityColor = (severity: number) => {
        if (severity >= 4) return "text-red-500 bg-red-500/10 border-red-500/20"
        if (severity >= 2) return "text-orange-500 bg-orange-500/10 border-orange-500/20"
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Navigation2 className="h-6 w-6 text-primary" />
                        Live Traffic
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium uppercase tracking-wider">
                        <Clock className="h-3 w-3" />
                        Updated {mounted ? lastRefresh.toLocaleTimeString() : "--:--:--"}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => location && fetchTrafficData(location.lat, location.lng)}
                    disabled={loading}
                    className="rounded-full h-10 w-10 border-primary/20 hover:bg-primary/5"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3"
                >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    {error}
                </motion.div>
            )}

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {incidents.length > 0 ? (
                        incidents.map((incident) => (
                            <motion.div
                                key={incident.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-4 rounded-3xl border bg-card/50 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow group overflow-hidden relative"
                            >
                                <div className="flex gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${getSeverityColor(incident.severity)}`}>
                                        <AlertTriangle className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">
                                                {incident.type}
                                            </span>
                                            <span className="text-[10px] font-mono whitespace-nowrap opacity-40">
                                                ID: {incident.id.slice(0, 8)}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                                            {incident.description}
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <Clock className="h-3 w-3 text-orange-400" />
                                                +{Math.round(incident.delay / 60)}m delay
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                <TrendingUp className="h-3 w-3 text-blue-400" />
                                                {(incident.distance / 1000).toFixed(1)} km
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all" />
                            </motion.div>
                        ))
                    ) : !loading && !error ? (
                        <div className="text-center py-12 space-y-3 bg-muted/20 rounded-[40px] border border-dashed border-border/50">
                            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Clear Roads!</p>
                                <p className="text-xs text-muted-foreground">No major traffic incidents detected nearby.</p>
                            </div>
                        </div>
                    ) : null}
                </AnimatePresence>
            </div>

            {loading && incidents.length === 0 && (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 w-full rounded-[32px] bg-muted/40 animate-pulse border" />
                    ))}
                </div>
            )}
        </div>
    )
}
