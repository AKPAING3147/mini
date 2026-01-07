'use client'

import dynamic from 'next/dynamic'

const SettingsPage = dynamic(() => import('@/app/components/SettingsPage'), { ssr: false })

export default function Page() {
    return <SettingsPage />
}
