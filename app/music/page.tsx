"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Script from "next/script"
import { Music2, ArrowRight, ExternalLink, Play, Pause, Volume2, SkipBack, SkipForward, LogIn, LogOut } from "lucide-react"
import { SearchBar } from "@/components/music/search-bar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { SpotifyEmbed } from "@/components/music/spotify-embed"

interface MusicResult {
    id: string
    name: string
    artist: string
    album?: string
    albumArt: string
    previewUrl?: string | null
    duration?: number
    spotifyUrl: string
    uri: string
    type: 'track' | 'album' | 'artist'
}

export default function MusicPage() {
    const { data: session, status } = useSession()
    const [currentTrack, setCurrentTrack] = useState<MusicResult | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(70)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [playbackMode, setPlaybackMode] = useState<'sdk' | 'embed' | 'preview' | null>(null)
    const [deviceId, setDeviceId] = useState<string | null>(null)
    const [player, setPlayer] = useState<any>(null)
    const [isPremium, setIsPremium] = useState<boolean | null>(null)
    const [isSDKReady, setIsSDKReady] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Detect mobile environment
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
            setIsMobile(isMobileDevice)
        }
        checkMobile()
    }, [])

    // Ensure SDK global handler exists even if not authenticated yet
    useEffect(() => {
        if (typeof window !== "undefined" && !(window as any).onSpotifyWebPlaybackSDKReady) {
            (window as any).onSpotifyWebPlaybackSDKReady = () => {
                console.log("Spotify SDK: Global handler defined (Stub)");
            };
        }
    }, []);

    useEffect(() => {
        if (status !== 'authenticated' || !session?.accessToken) return

        // Define the real global callback for Spotify SDK
        const initPlayer = () => {
            if (player) return // Already initialized

            const newPlayer = new (window as any).Spotify.Player({
                name: 'Note Music Explorer',
                getOAuthToken: (cb: any) => { cb(session.accessToken as string); },
                volume: volume / 100
            });

            newPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
                console.log('Spotify SDK: Ready with Device ID', device_id);
                setDeviceId(device_id);
                setIsPremium(true);
                setErrorMsg(null);
            });

            newPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                console.log('Spotify SDK: Device ID has gone offline', device_id);
                setDeviceId(null);
            });

            newPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
                console.error('Spotify SDK: Initialization Error', message);
            });

            newPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
                console.error('Spotify SDK: Authentication Error', message);
                setErrorMsg("Spotify session expired. Please reconnect.");
            });

            newPlayer.addListener('account_error', ({ message }: { message: string }) => {
                console.log('Spotify SDK: Account type detected as Free. Switching to Preview Mode.');
                setIsPremium(false);
                setDeviceId(null);
            });

            newPlayer.addListener('player_state_changed', (state: any) => {
                if (!state) return;
                setIsPlaying(!state.paused);
                setProgress((state.position / state.duration) * 100);
            });

            newPlayer.connect().then((success: boolean) => {
                if (success) console.log('Spotify SDK: Connected successfully');
            });
            setPlayer(newPlayer);
        };

        (window as any).onSpotifyWebPlaybackSDKReady = initPlayer;

        // If Spotify is already loaded, trigger the callback manually
        if ((window as any).Spotify) {
            initPlayer();
        }

        setIsSDKReady(true);

        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, [status, session]);

    useEffect(() => {
        if (player) {
            player.setVolume(volume / 100);
        }
    }, [volume, player]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100
        }
    }, [volume])

    const handleResultSelect = async (result: MusicResult) => {
        if (result.type !== 'track') {
            window.open(result.spotifyUrl, '_blank')
            return
        }

        setErrorMsg(null)

        // Force Embed Mode for Mobile (SDK doesn't support mobile browsers)
        if (isMobile) {
            console.log("Mobile detected: Forcing Embed Mode")
            setPlaybackMode('embed')
            setCurrentTrack(result)
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
            return
        }

        // Try Full Playback if authenticated via SDK AND we haven't confirmed they are non-Premium
        if (status === 'authenticated' && session?.accessToken && isPremium !== false) {
            if (!deviceId) {
                console.log("No device ID yet, checking player status...")
                // If we're still waiting but they have Premium (or we don't know yet)
                if (player) {
                    player.getCurrentState().then((state: any) => {
                        if (!state && isPremium === true) {
                            setErrorMsg("Spotify player is connecting... please wait a moment.");
                        }
                    });
                }
                // Don't return here, let it fall through to preview if possible
            } else {
                try {
                    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${session.accessToken}`,
                        },
                        body: JSON.stringify({ uris: [result.uri] }),
                    })

                    if (response.ok) {
                        if (audioRef.current) {
                            audioRef.current.pause()
                            audioRef.current.src = "" // Clear preview source
                        }
                        setPlaybackMode('sdk')
                        setCurrentTrack(result)
                        setIsPlaying(true)
                        return
                    } else {
                        const data = await response.json()
                        console.error("Spotify Play API Error:", data)
                        if (data.error?.reason === 'PREMIUM_REQUIRED' || data.error?.status === 403) {
                            // SWITCH TO EMBED MODE FOR FREE USERS
                            console.log("Switching to Embed Mode for Free account")
                            setPlaybackMode('embed')
                            setCurrentTrack(result)
                            if (audioRef.current) {
                                audioRef.current.pause()
                                audioRef.current.src = ""
                            }
                            return
                        } else if (data.error?.reason === 'NO_ACTIVE_DEVICE') {
                            setErrorMsg("Spotify player lost connection. Please refresh.");
                        } else {
                            setErrorMsg(`Playback Error: ${data.error?.message || "Check your Spotify connection."}`);
                        }

                        // If we had no previewURL to fall back to anyway, return now so we don't overwrite the error
                        if (!result.previewUrl) return
                    }
                } catch (error) {
                    console.error("Spotify SDK playback failed", error)
                }
            }
        }

        // Handle explicitly non-premium accounts
        if (status === 'authenticated' && isPremium === false) {
            setPlaybackMode('embed')
            setCurrentTrack(result)
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ""
            }
            return
        }

        // Fallback to Preview Player
        if (!result.previewUrl) {
            if (isPremium === false) {
                // TRY EMBED as last resort even if we don't know profile yet
                setPlaybackMode('embed')
                setCurrentTrack(result)
                return
            } else {
                setErrorMsg("Playback is currently unavailable for this track.");
            }
            return
        }

        if (currentTrack?.id === result.id && playbackMode === 'preview') {
            togglePlayPause()
            return
        }

        // If playing via SDK, pause it first
        if (player) {
            player.pause();
        }

        setPlaybackMode('preview')
        setCurrentTrack(result)
        setIsPlaying(true)
        setProgress(0)

        if (audioRef.current) {
            audioRef.current.src = result.previewUrl
            audioRef.current.play().catch(console.error)
        }
    }

    const togglePlayPause = () => {
        // If we have an active SDK player and no preview source is loaded, use the SDK
        if (playbackMode === 'sdk' && player) {
            player.togglePlay();
            return;
        }

        if (playbackMode === 'embed') return; // Embed has its own UI

        if (!audioRef.current || !currentTrack) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play().catch(console.error)
        }
        setIsPlaying(!isPlaying)
    }

    const handleProgressChange = (vals: number[]) => {
        const newProgress = vals[0];
        setProgress(newProgress);

        if (player && currentTrack && !audioRef.current?.src) {
            const position_ms = (newProgress / 100) * (currentTrack.duration || 0);
            player.seek(position_ms).catch(console.error);
        } else if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime
            const duration = audioRef.current.duration
            if (duration) {
                setProgress((current / duration) * 100)
            }
        }
    }

    const handleEnded = () => {
        setIsPlaying(false)
        setProgress(0)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const currentSeconds = (audioRef.current && audioRef.current.src)
        ? (audioRef.current.currentTime || 0)
        : (progress / 100 * (currentTrack?.duration || 0) / 1000)
    const totalSeconds = (audioRef.current && audioRef.current.src)
        ? 30
        : ((currentTrack?.duration || 0) / 1000)

    return (
        <main className="min-h-screen bg-background pb-24 p-4 md:p-6">
            <Script
                src="https://sdk.scdn.co/spotify-player.js"
                strategy="lazyOnload"
            />
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Music2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Music Explorer</h1>
                            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                                Search & listen to full tracks with ads instantly • Powered by Spotify
                                {!isPremium && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold uppercase ml-2">Ad-Supported</span>}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {status === 'authenticated' ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => signOut()}
                                className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Disconnect</span>
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => signIn('spotify')}
                                className="rounded-full gap-2 shadow-lg shadow-primary/20"
                            >
                                <LogIn className="h-4 w-4" />
                                <span>Connect Spotify</span>
                            </Button>
                        )}
                    </div>
                </header>

                {/* Error Message for Playback */}
                {errorMsg && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-destructive flex items-center justify-center gap-2">
                            {errorMsg}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-1 text-[10px] hover:bg-destructive/10"
                                onClick={() => setErrorMsg(null)}
                            >
                                (dismiss)
                            </Button>
                        </p>
                    </div>
                )}

                {/* Main Player Display */}
                {currentTrack && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        {playbackMode === 'embed' ? (
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                                    <Play className="h-3 w-3 fill-current" />
                                    Full Track (Ad-Supported)
                                </div>
                                <SpotifyEmbed uri={currentTrack.uri} />
                            </div>
                        ) : (
                            <div className="relative overflow-hidden bg-card border rounded-2xl shadow-2xl p-6 md:p-8">
                                {/* Background Decoration */}
                                <div
                                    className="absolute inset-0 opacity-10 blur-3xl -z-10 pointer-events-none"
                                    style={{
                                        backgroundImage: `url(${currentTrack.albumArt})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                />

                                <div className="flex flex-col md:flex-row gap-8 items-center md:items-stretch">
                                    <div className="relative group flex-shrink-0">
                                        <img
                                            src={currentTrack.albumArt}
                                            alt={currentTrack.name}
                                            width={240}
                                            height={240}
                                            className="w-48 h-48 md:w-60 md:h-60 rounded-xl shadow-2xl transition-transform group-hover:scale-105 duration-500"
                                        />
                                        {isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className={`w-1 bg-white rounded-full animate-music-bar h-8 delay-${i * 100}`}
                                                            style={{ animationDelay: `${i * 150}ms`, height: `${10 + Math.random() * 20}px` }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between text-center md:text-left min-w-0 py-2">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                Now Playing
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-extrabold truncate tracking-tight py-1">{currentTrack.name}</h2>
                                            <p className="text-xl text-primary/80 font-medium truncate">{currentTrack.artist}</p>
                                            <p className="text-muted-foreground truncate italic opacity-70">{currentTrack.album}</p>
                                        </div>

                                        <div className="mt-8 space-y-6">
                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <Slider
                                                    value={[progress]}
                                                    max={100}
                                                    step={0.1}
                                                    onValueChange={handleProgressChange}
                                                    className="cursor-pointer"
                                                />
                                                <div className="flex justify-between text-[11px] font-medium text-muted-foreground font-mono uppercase">
                                                    <span>{formatTime(currentSeconds)}</span>
                                                    <span className="text-primary/60">{playbackMode === 'preview' ? '30s Preview' : 'Full Track'}</span>
                                                    <span>{formatTime(totalSeconds)}</span>
                                                </div>
                                            </div>

                                            {/* Detailed Controls */}
                                            <div className="flex flex-wrap items-center gap-8 justify-center md:justify-start">
                                                <div className="flex items-center gap-4">
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                                        <SkipBack className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        onClick={togglePlayPause}
                                                        size="lg"
                                                        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        {isPlaying ? (
                                                            <Pause className="h-8 w-8 fill-current" />
                                                        ) : (
                                                            <Play className="h-8 w-8 ml-1 fill-current" />
                                                        )}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                                        <SkipForward className="h-5 w-5" />
                                                    </Button>
                                                </div>

                                                <div className="hidden sm:flex items-center gap-3 bg-muted/40 p-2 rounded-full px-4 border border-border/50">
                                                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                                                    <Slider
                                                        value={[volume]}
                                                        max={100}
                                                        step={1}
                                                        onValueChange={(vals: number[]) => setVolume(vals[0])}
                                                        className="w-24 cursor-pointer"
                                                    />
                                                </div>

                                                <Button variant="outline" size="sm" asChild className="rounded-full shadow-sm hover:bg-muted group">
                                                    <a href={currentTrack.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                        Spotify
                                                        <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Search Experience */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
                            Catalog Search
                            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50" />
                        </h2>
                    </div>
                    <SearchBar
                        onResultSelect={handleResultSelect}
                        token={session?.accessToken}
                        market={(session?.user as any)?.country}
                    />
                </div>

                {/* Footer Credits */}
                <footer className="pt-16 pb-8 text-center space-y-2">
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-6" />
                    <p className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">
                        Designed & Engineered by <span className="text-foreground">Jun Gil Casquejo</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground opacity-50">© 2024 Note Music Explorer • Minimalist Audio Integration</p>
                </footer>
            </div>
        </main>
    )
}
