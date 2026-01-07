import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { id, first_name, username } = await request.json()
        const userId = String(id)

        let user = await prisma.user.findUnique({ where: { id: userId } })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    id: userId,
                    firstName: first_name,
                    username: username,
                    foodPreferences: ['Chocolate', 'Soup', 'Bubble Tea']
                }
            })
        } else if (username && user.username !== username) {
            await prisma.user.update({
                where: { id: userId },
                data: { username, firstName: first_name }
            })
        }

        const latestCycle = await prisma.cycle.findFirst({
            where: { userId },
            orderBy: { startDate: 'desc' }
        });

        return NextResponse.json({ user, latestCycle })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error processing user' }, { status: 500 })
    }
}
