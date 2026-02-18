import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { error: 'Spotify credentials not configured' },
            { status: 500 }
        )
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error_description || 'Failed to get token')
        }

        return NextResponse.json({
            access_token: data.access_token,
            expires_in: data.expires_in,
        })
    } catch (error) {
        console.error('Spotify token error:', error)
        return NextResponse.json(
            { error: 'Failed to authenticate with Spotify' },
            { status: 500 }
        )
    }
}
