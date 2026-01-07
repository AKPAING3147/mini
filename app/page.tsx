import dynamic from 'next/dynamic'

const Home = dynamic(() => import('@/app/components/Home'), { ssr: false })

export default function Page() {
  return <Home />
}
