import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import SpotifyProvider from "next-auth/providers/spotify"

const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
].join(" ")

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
        }),
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
            authorization: { params: { scope: scopes } },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile, user }) {
            if (user) token.userId = user.id
            if (account) {
                token.accessToken = account.access_token
                token.refreshToken = account.refresh_token
                token.expiresAt = account.expires_at
            }
            if (profile) {
                token.country = (profile as { country?: string }).country
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            if (session.user) {
                (session.user as { id?: string }).id = token.userId as string
                ;(session.user as { country?: string }).country = token.country as string
            }
            return session
        },
    },
}
