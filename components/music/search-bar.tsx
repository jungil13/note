"use client"

import { useState } from "react"
import { Search, Loader2, Disc, Music, User, Key, Youtube, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface SearchBarProps {
    onResultSelect: (result: MusicResult) => void
    token?: string | null
    market?: string | null
}

export function SearchBar({ onResultSelect, token, market }: SearchBarProps) {
    const [query, setQuery] = useState("")
    const [searchType, setSearchType] = useState<'track' | 'album' | 'artist'>('track')
    const [results, setResults] = useState<MusicResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async (searchQuery: string, type: string = searchType) => {
        if (!searchQuery.trim()) {
            setResults([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const url = new URL(`/api/spotify/search`, window.location.origin)
            url.searchParams.set('q', searchQuery)
            url.searchParams.set('type', type)
            if (market) url.searchParams.set('market', market)

            const response = await fetch(url.toString(), {
                headers: token ? {
                    'Authorization': `Bearer ${token}`
                } : {}
            })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Search failed')
            }

            // Map raw Spotify response to our MusicResult format
            let mappedResults: MusicResult[] = []

            if (type === 'track' && data.tracks) {
                mappedResults = data.tracks.items.map((track: any) => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists.map((a: any) => a.name).join(', '),
                    album: track.album.name,
                    albumArt: track.album.images[0]?.url,
                    previewUrl: track.preview_url,
                    duration: track.duration_ms,
                    spotifyUrl: track.external_urls.spotify,
                    uri: track.uri,
                    type: 'track'
                }))
            } else if (type === 'album' && data.albums) {
                mappedResults = data.albums.items.map((album: any) => ({
                    id: album.id,
                    name: album.name,
                    artist: album.artists.map((a: any) => a.name).join(', '),
                    album: album.name,
                    albumArt: album.images[0]?.url,
                    spotifyUrl: album.external_urls.spotify,
                    uri: album.uri,
                    type: 'album'
                }))
            } else if (type === 'artist' && data.artists) {
                mappedResults = data.artists.items.map((artist: any) => ({
                    id: artist.id,
                    name: artist.name,
                    artist: artist.name,
                    albumArt: artist.images[0]?.url,
                    spotifyUrl: artist.external_urls.spotify,
                    uri: artist.uri,
                    type: 'artist'
                }))
            }

            setResults(mappedResults)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search')
            setResults([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)

        // Debounce search
        const timeoutId = setTimeout(() => {
            handleSearch(value)
        }, 500)

        return () => clearTimeout(timeoutId)
    }

    const handleResultClick = (result: MusicResult) => {
        onResultSelect(result)
    }

    return (
        <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Type Selector */}
                <div className="flex bg-muted rounded-lg p-1">
                    <button
                        onClick={() => {
                            setSearchType('track')
                            if (query) handleSearch(query, 'track')
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            searchType === 'track' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Music className="h-3.5 w-3.5" />
                        Tracks
                    </button>
                    <button
                        onClick={() => {
                            setSearchType('album')
                            if (query) handleSearch(query, 'album')
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            searchType === 'album' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Disc className="h-3.5 w-3.5" />
                        Albums
                    </button>
                    <button
                        onClick={() => {
                            setSearchType('artist')
                            if (query) handleSearch(query, 'artist')
                        }}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                            searchType === 'artist' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <User className="h-3.5 w-3.5" />
                        Artists
                    </button>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={`Search ${searchType}s...`}
                    className="w-full pl-10 pr-4 py-3 bg-card border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Search Results */}
            {results && results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => (
                        <div
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="bg-card border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors group"
                        >
                            <div className="flex gap-3">
                                {result.albumArt && (
                                    <img
                                        src={result.albumArt}
                                        alt={result.name}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 rounded shadow-sm"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                        {result.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">{result.artist}</p>
                                    {result.album && result.type === 'track' && (
                                        <p className="text-xs text-muted-foreground truncate opacity-70">{result.album}</p>
                                    )}
                                    {result.type === 'track' && !result.previewUrl && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-amber-500">No Spotify preview</p>
                                            <a
                                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${result.name} ${result.artist}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-[9px] text-primary hover:underline bg-primary/5 px-1.5 py-0.5 rounded"
                                            >
                                                <Youtube className="h-3 w-3" />
                                                Play on YouTube
                                            </a>
                                        </div>
                                    )}
                                    <span className="inline-block mt-1 text-[9px] uppercase font-bold tracking-wider text-muted-foreground/50 border rounded px-1">
                                        {result.type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Results */}
            {query && !isLoading && results?.length === 0 && !error && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No results found for &quot;{query}&quot;</p>
                </div>
            )}
        </div>
    )
}
