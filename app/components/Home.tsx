'use client'

import { useState, useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import BottomNav from './BottomNav'

interface UserState {
    id: string
    cycleLength: number
    periodDuration: number
}

interface Cycle {
    startDate: string
}

export default function Home() {
    const [user, setUser] = useState<UserState | null>(null)
    const [lastCycle, setLastCycle] = useState<Cycle | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // TWA Init
        if (typeof window !== 'undefined' && WebApp) {
            WebApp.ready()
            try {
                WebApp.expand()
            } catch (e) {
                console.log('Not in Telegram is ok')
            }

            // Mock User for Dev
            const initUser = WebApp.initDataUnsafe?.user || { id: 999111, first_name: 'TestUser', username: 'test' };

            // Sync User
            fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(initUser)
            })
                .then(res => res.json())
                .then(data => {
                    setUser(data.user)
                    setLastCycle(data.latestCycle)
                    setLoading(false)
                })
                .catch(e => console.error(e))
        }
    }, [])

    const handlePeriodStart = async () => {
        if (!user) return;
        if (confirm("Confirm: Period Started Today?")) {
            setLoading(true)
            try {
                const res = await fetch('/api/cycle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, date: new Date() })
                })
                const data = await res.json()
                setLastCycle(data)
                if (WebApp.HapticFeedback) WebApp.HapticFeedback.notificationOccurred('success')
                alert("Cycle started! Partner notified (if enabled).")
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
    }

    // Prediction Logic
    let daysLate = 0;
    let daysUntil = 0;
    let statusText = "No data";
    let cycleDay = 1;

    if (lastCycle && user) {
        const start = new Date(lastCycle.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        cycleDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + user.cycleLength);

        const diffNext = nextDate.getTime() - today.getTime();
        daysUntil = Math.ceil(diffNext / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            daysLate = Math.abs(daysUntil);
            statusText = `${daysLate} Day${daysLate > 1 ? 's' : ''} Late`;
        } else {
            statusText = `${daysUntil} Days Left`;
        }

        if (cycleDay <= user.periodDuration) {
            statusText = `Period Day ${cycleDay}`;
        }
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>

    return (
        <div className="container">
            <header className="mb-8 mt-4">
                <h1 className="text-2xl font-bold text-center">🌸 Cycle Tracker</h1>
            </header>

            {/* Main Status Circle */}
            <div className="flex justify-center mb-8" style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    border: '4px solid var(--primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--card-bg)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '8px' }}>Cycle Day</span>
                    <span style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{cycleDay}</span>
                    <span style={{ color: 'var(--primary-dark)', fontWeight: '500', marginTop: '8px' }}>{statusText}</span>
                </div>
            </div>

            <button className="btn btn-primary" onClick={handlePeriodStart}>
                🩸 Period Started Today
            </button>

            {/* Calendar Grid (Simplified View) */}
            <div className="card mt-6">
                <h2 className="text-lg font-semibold mb-4">This Month</h2>
                <div className="calendar-grid">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="day-header">{d}</div>)}
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className={`calendar-day ${i === 14 ? 'ovulation' : ''} ${i >= 0 && i < 5 ? 'active' : ''}`}>
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
