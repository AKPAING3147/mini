'use client'

import dynamic from 'next/dynamic'

const SymptomsPage = dynamic(() => import('@/app/components/SymptomsPage'), { ssr: false })

export default function Page() {
    return <SymptomsPage />
}
