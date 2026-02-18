import { NextRequest, NextResponse } from 'next/server'

// Spotify API credentials (from .env.local)
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'track'
    const market = searchParams.get('market')
    const manualToken = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!query) {
        return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
    }

    try {
        let accessToken = manualToken

        if (!accessToken) {
            // Get access token using client credentials logic provided by user
            const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
            const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${basic}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials',
            })

            const tokenData = await tokenResponse.json()

            if (!tokenResponse.ok) {
                throw new Error(tokenData.error_description || 'Failed to get token')
            }

            accessToken = tokenData.access_token
        }

        // Make a GET request to the Spotify API using the obtained (or manual) access token
        const searchUrl = new URL('https://api.spotify.com/v1/search')
        searchUrl.searchParams.set('q', query)
        searchUrl.searchParams.set('type', type)
        searchUrl.searchParams.set('limit', '20')
        searchUrl.searchParams.set('include_external', 'audio')
        if (market) searchUrl.searchParams.set('market', market)

        const searchResponse = await fetch(
            searchUrl.toString(),
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        )

        const searchData = await searchResponse.json()

        if (!searchResponse.ok) {
            throw new Error(searchData.error?.message || 'Search failed')
        }

        // Send the response received from Spotify API back to the client
        return NextResponse.json(searchData)
    } catch (error) {
        // If there's an error, log it and send an internal server error response
        console.error("Error searching tracks on Spotify:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
