import dynamic from 'next/dynamic'

const FoodsPage = dynamic(() => import('@/app/components/FoodsPage'), { ssr: false })

export default function Page() {
    return <FoodsPage />
}
