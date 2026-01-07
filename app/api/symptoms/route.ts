import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const symptoms = await prisma.symptom.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 30
        })

        return NextResponse.json(symptoms)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error fetching symptoms' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const { userId, date, mood, pain, flow, note } = await request.json()

        const symptom = await prisma.symptom.create({
            data: {
                userId,
                date: new Date(date),
                mood,
                pain,
                flow,
                note
            }
        })

        return NextResponse.json(symptom)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error saving symptom' }, { status: 500 })
    }
}
