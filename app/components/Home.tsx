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
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 8)) // January 8, 2026

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

        if (WebApp.showConfirm) {
            WebApp.showConfirm("Confirm: Period Started Today?", async (confirmed) => {
                if (confirmed) {
                    setLoading(true)
                    try {
                        const res = await fetch('/api/cycle', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id, date: new Date(2026, 0, 8) })
                        })
                        const data = await res.json()
                        setLastCycle(data)
                        if (WebApp.HapticFeedback) WebApp.HapticFeedback.notificationOccurred('success')

                        if (WebApp.showAlert) {
                            WebApp.showAlert("Cycle started! Partner notified (if enabled).")
                        }
                    } catch (e) {
                        console.error(e)
                        if (WebApp.showAlert) {
                            WebApp.showAlert("Error starting cycle. Please try again.")
                        }
                    } finally {
                        setLoading(false)
                    }
                }
            })
        } else {
            // Fallback for browser testing
            if (confirm("Confirm: Period Started Today?")) {
                setLoading(true)
                try {
                    const res = await fetch('/api/cycle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, date: new Date(2026, 0, 8) })
                    })
                    const data = await res.json()
                    setLastCycle(data)
                    alert("Cycle started! Partner notified (if enabled).")
                } catch (e) {
                    console.error(e)
                    alert("Error starting cycle. Please try again.")
                } finally {
                    setLoading(false)
                }
            }
        }
    }

    // Calendar Generation for 2026
    const generateCalendar = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const today = new Date(2026, 0, 8) // January 8, 2026

        const days = []

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, className: '' })
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            let className = 'calendar-day'

            // Check if today
            if (date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()) {
                className += ' today'
            }

            // Calculate if period/ovulation based on last cycle
            if (lastCycle && user) {
                const cycleStart = new Date(lastCycle.startDate)
                const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))

                // Period days
                if (daysSinceStart >= 0 && daysSinceStart < user.periodDuration) {
                    className += ' active'
                }

                // Predicted next periods
                const cyclesToCheck = 3;
                for (let c = 1; c <= cyclesToCheck; c++) {
                    const nextCycleStart = user.cycleLength * c;
                    if (daysSinceStart >= nextCycleStart && daysSinceStart < nextCycleStart + user.periodDuration) {
                        className += ' prediction'
                    }

                    // Ovulation (middle of each cycle, around day 14)
                    const ovulationDay = nextCycleStart - Math.floor(user.cycleLength / 2)
                    if (daysSinceStart >= ovulationDay - 1 && daysSinceStart <= ovulationDay + 1) {
                        className += ' ovulation'
                    }
                }
            }

            days.push({ day, className })
        }

        return days
    }

    // Prediction Logic
    let daysLate = 0;
    let daysUntil = 0;
    let statusText = "No data";
    let cycleDay = 1;

    if (lastCycle && user) {
        const start = new Date(lastCycle.startDate);
        const today = new Date(2026, 0, 8); // January 8, 2026
        const diffTime = today.getTime() - start.getTime();
        cycleDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

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

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>

    return (
        <div className="container">
            <header style={{ marginBottom: '32px', marginTop: '16px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', textAlign: 'center' }}>🌸 Cycle Tracker</h1>
            </header>

            {/* Main Status Circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
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

            {/* Calendar */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--primary-dark)' }}
                    >←</button>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{monthName}</h2>
                    <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--primary-dark)' }}
                    >→</button>
                </div>

                <div className="calendar-grid">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="day-header">{d}</div>)}
                    {generateCalendar().map((item, i) => (
                        <div key={i} className={item.className}>
                            {item.day || ''}
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
