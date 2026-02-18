"use client"

import { useEffect, useRef } from "react"

interface SpotifyEmbedProps {
    uri: string
    width?: string | number
    height?: string | number
}

declare global {
    interface Window {
        onSpotifyIframeApiReady?: (IFrameAPI: any) => void
        SpotifyIframeApi?: any
    }
}

export function SpotifyEmbed({ uri, width = "100%", height = "152" }: SpotifyEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const embedControllerRef = useRef<any>(null)

    useEffect(() => {
        const loadIframeApi = () => {
            if (window.SpotifyIframeApi) {
                initializeEmbed(window.SpotifyIframeApi)
            } else {
                // If not ready, the script will call onSpotifyIframeApiReady
                window.onSpotifyIframeApiReady = (IFrameAPI) => {
                    window.SpotifyIframeApi = IFrameAPI
                    initializeEmbed(IFrameAPI)
                }

                // Check if script is already added
                if (!document.getElementById("spotify-iframe-api")) {
                    const script = document.createElement("script")
                    script.id = "spotify-iframe-api"
                    script.src = "https://open.spotify.com/embed/iframe-api/v1"
                    script.async = true
                    document.body.appendChild(script)
                }
            }
        }

        const initializeEmbed = (IFrameAPI: any) => {
            if (!containerRef.current) return

            const options = {
                uri,
                width,
                height,
            }

            IFrameAPI.createController(containerRef.current, options, (EmbedController: any) => {
                embedControllerRef.current = EmbedController
                // Automatically play when ready
                EmbedController.play()
            })
        }

        loadIframeApi()

        return () => {
            // Cleanup controller if needed (the API handles most of this)
            if (embedControllerRef.current) {
                embedControllerRef.current.destroy()
            }
        }
    }, [uri])

    return (
        <div
            ref={containerRef}
            className="w-full rounded-2xl overflow-hidden shadow-2xl bg-card border border-border/50 animate-in fade-in zoom-in duration-500"
            style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
        />
    )
}
