'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    const navs = [
        { label: 'Calendar', icon: '📅', path: '/' },
        { label: 'Symptoms', icon: '📝', path: '/symptoms' },
        { label: 'Foods', icon: '🍫', path: '/foods' },
        { label: 'Partner', icon: '❤️', path: '/partner' },
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
