import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
    try {
        const { partnerId, message } = await request.json()

        if (!partnerId || !message) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        await sendTelegramMessage(partnerId, message)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error sending message' }, { status: 500 })
    }
}
