import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch user's cycle history
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const cycles = await prisma.cycle.findMany({
            where: { userId },
            orderBy: { startDate: 'desc' },
            take: 12 // Last 12 cycles
        })

        return NextResponse.json(cycles)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error fetching cycles' }, { status: 500 })
    }
}

// POST - Add new cycle
export async function POST(request: Request) {
    try {
        const { userId, date } = await request.json()

        const cycle = await prisma.cycle.create({
            data: {
                userId,
                startDate: new Date(date)
            }
        })

        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (user && user.partnerEnabled && user.partnerId) {
            let message = user.partnerMessage || "Hi ❤️ My period started today.";

            const foods = user.foodPreferences || [];
            if (foods.length > 0) {
                message += `\n\nIf possible, I'd love: ${foods.slice(0, 3).join(', ')}`;
                if (user.foodNote) message += `\nNote: ${user.foodNote}`;
            }

            const { sendTelegramMessage } = await import('@/lib/telegram')
            await sendTelegramMessage(user.partnerId, message);
        }

        return NextResponse.json(cycle)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error starting cycle' }, { status: 500 })
    }
}

// DELETE - Remove wrong entry
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Cycle ID required' }, { status: 400 })
        }

        await prisma.cycle.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error deleting cycle' }, { status: 500 })
    }
}
