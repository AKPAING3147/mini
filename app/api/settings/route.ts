import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { userId, ...data } = await request.json()

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: data
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
    }
}
