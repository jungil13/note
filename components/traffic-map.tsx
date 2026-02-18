"use client"

import { useEffect, useRef, useState } from "react"
import Head from "next/head"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Layers, Map as MapIcon, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrafficMapProps {
    center?: { lat: number; lng: number }
    zoom?: number
}

declare global {
    interface Window {
        maplibregl: any
    }
}

export function TrafficMap({ center = { lat: 10.3157, lng: 123.8854 }, zoom = 12 }: TrafficMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [libLoaded, setLibLoaded] = useState(false)
    const apiKey = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

    // Load MapLibre GL JS and CSS dynamically
    useEffect(() => {
        if (window.maplibregl) {
            setLibLoaded(true)
            return
        }

        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.css"
        document.head.appendChild(link)

        const script = document.createElement("script")
        script.src = "https://unpkg.com/maplibre-gl@4.0.0/dist/maplibre-gl.js"
        script.async = true
        script.onload = () => setLibLoaded(true)
        document.head.appendChild(script)

        return () => {
            // We don't necessarily want to remove the script/link on unmount as other maps might use it
        }
    }, [])

    useEffect(() => {
        if (!libLoaded || !mapContainerRef.current || !apiKey) return

        const map = new window.maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    "tomtom-tiles": {
                        type: "raster",
                        tiles: [
                            `https://a.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${apiKey}`,
                            `https://b.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${apiKey}`,
                            `https://c.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${apiKey}`,
                            `https://d.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${apiKey}`
                        ],
                        tileSize: 256,
                        attribution: "&copy; TomTom"
                    },
                    "traffic-flow": {
                        type: "raster",
                        tiles: [
                            `https://a.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}`,
                            `https://b.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}`
                        ],
                        tileSize: 256
                    },
                    "traffic-incidents": {
                        type: "raster",
                        tiles: [
                            `https://a.api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${apiKey}`,
                            `https://b.api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${apiKey}`
                        ],
                        tileSize: 256
                    }
                },
                layers: [
                    {
                        id: "base-map",
                        type: "raster",
                        source: "tomtom-tiles"
                    },
                    {
                        id: "traffic-flow-layer",
                        type: "raster",
                        source: "traffic-flow",
                        paint: { "raster-opacity": 0.8 }
                    },
                    {
                        id: "traffic-incidents-layer",
                        type: "raster",
                        source: "traffic-incidents",
                        paint: { "raster-opacity": 0.9 }
                    }
                ]
            },
            center: [center.lng, center.lat],
            zoom: zoom
        })

        map.addControl(new window.maplibregl.NavigationControl(), "top-right")
        map.addControl(new window.maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true
        }))

        map.on("load", () => {
            setIsLoaded(true)
            mapRef.current = map
        })

        return () => {
            map.remove()
        }
    }, [libLoaded, apiKey])

    // Update map center if props change (e.g. from Geolocation)
    useEffect(() => {
        if (mapRef.current && center) {
            mapRef.current.flyTo({ center: [center.lng, center.lat], zoom: 14 })
        }
    }, [center])

    return (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-[40px] overflow-hidden border shadow-inner bg-muted/20 group">
            {!isLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest opacity-60">Initializing Map...</p>
                </div>
            )}

            <div ref={mapContainerRef} className="w-full h-full" />

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
                    className="bg-background/90 backdrop-blur-xl border p-3 rounded-2xl shadow-2xl flex items-center gap-3 pointer-events-auto"
                >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-tighter opacity-50">Real-time Map</p>
                        <p className="text-xs font-bold leading-none">Traffic Flow & Incidents</p>
                    </div>
                </motion.div>

                <div className="flex gap-2 pointer-events-auto">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-md shadow-xl border-primary/10">
                        <Layers className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background/80 backdrop-blur-md shadow-xl border-primary/10">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Legend Overlay */}
            <AnimatePresence>
                {isLoaded && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-6 left-6 bg-background/80 backdrop-blur-md border rounded-2xl p-3 shadow-xl pointer-events-none hidden md:block"
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-60 text-center">Flow Status</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-8 bg-green-500 rounded-full" />
                                <span className="text-[10px] font-medium italic">Fast</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-8 bg-orange-500 rounded-full" />
                                <span className="text-[10px] font-medium italic">Moderate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-8 bg-red-500 rounded-full" />
                                <span className="text-[10px] font-medium italic">Congested</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
