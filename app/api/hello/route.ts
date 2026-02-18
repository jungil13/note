import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: "ok",
        message: "API routing is working correctly on Vercel!",
        timestamp: new Date().toISOString()
    })
}
