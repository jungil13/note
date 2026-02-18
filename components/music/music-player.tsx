"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface Track {
    id: string
    name: string
    artist: string
    album: string
    albumArt: string
    previewUrl: string | null
    duration: number
    spotifyUrl: string
}

interface MusicPlayerProps {
    track: Track | null
    onEnded?: () => void
}

export function MusicPlayer({ track, onEnded }: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isMuted, setIsMuted] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (audioRef.current && track?.previewUrl) {
            audioRef.current.src = track.previewUrl
            audioRef.current.load()
            if (isPlaying) {
                audioRef.current.play()
            }
        }
    }, [track])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    const togglePlayPause = () => {
        if (!audioRef.current || !track?.previewUrl) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value)
        setCurrentTime(time)
        if (audioRef.current) {
            audioRef.current.currentTime = time
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value)
        setVolume(vol)
        setIsMuted(false)
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        onEnded?.()
    }

    if (!track) {
        return (
            <div className="bg-card border rounded-lg p-6 text-center">
                <p className="text-muted-foreground">Search for music to start playing</p>
            </div>
        )
    }

    return (
        <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            <div className="p-6">
                <div className="flex gap-4 items-start mb-4">
                    {track.albumArt && (
                        <img
                            src={track.albumArt}
                            alt={track.album}
                            className="w-20 h-20 rounded-lg shadow-md"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{track.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                        {!track.previewUrl && (
                            <p className="text-xs text-amber-500 mt-1">Preview not available</p>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        disabled={!track.previewUrl}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-accent rounded-full transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <button
                        onClick={togglePlayPause}
                        disabled={!track.previewUrl}
                        className={cn(
                            "p-4 rounded-full transition-colors",
                            track.previewUrl
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6" />
                        )}
                    </button>

                    <a
                        href={track.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        Open in Spotify
                    </a>
                </div>
            </div>
        </div>
    )
}
