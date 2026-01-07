import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
    try {
        const { userId, date } = await request.json()

        // 1. Create Cycle
        const cycle = await prisma.cycle.create({
            data: {
                userId,
                startDate: new Date(date)
            }
        })

        // 2. Check & Trigger Partner Notification
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (user && user.partnerEnabled && user.partnerId) {
            let message = user.partnerMessage || "Hi ❤️ My period started today.";

            const foods = user.foodPreferences || [];
            if (foods.length > 0) {
                message += `\n\nIf possible, I'd love: ${foods.slice(0, 3).join(', ')}`;
                if (user.foodNote) message += `\nNote: ${user.foodNote}`;
            }

            await sendTelegramMessage(user.partnerId, message);
        }

        return NextResponse.json(cycle)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error starting cycle' }, { status: 500 })
    }
}
