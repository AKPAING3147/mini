'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    const navs = [
        { label: 'ပြက္ခဒိန်', icon: '📅', path: '/' },
        { label: 'လက္ခဏာ', icon: '📝', path: '/symptoms' },
        { label: 'အစားအစာ', icon: '🍫', path: '/foods' },
        { label: 'ဆက်တင်', icon: '⚙️', path: '/settings' },
    ]

    return (
        <nav className="bottom-nav">
            {navs.map(n => (
                <Link key={n.path} href={n.path} className={`nav-item ${pathname === n.path ? 'active' : ''}`}>
                    <div className="nav-icon">{n.icon}</div>
                    <span>{n.label}</span>
                </Link>
            ))}
        </nav>
    )
}
