import dynamic from 'next/dynamic'

const PartnerPage = dynamic(() => import('@/app/components/PartnerPage'), { ssr: false })

export default function Page() {
    return <PartnerPage />
}
