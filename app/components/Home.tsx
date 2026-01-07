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
    id: string
    startDate: string
}

export default function Home() {
    const [user, setUser] = useState<UserState | null>(null)
    const [lastCycle, setLastCycle] = useState<Cycle | null>(null)
    const [cycleHistory, setCycleHistory] = useState<Cycle[]>([])
    const [loading, setLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 8))
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 8).toISOString().split('T')[0])
    const [showHistory, setShowHistory] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && WebApp) {
            WebApp.ready()
            try {
                WebApp.expand()
            } catch (e) {
                console.log('Not in Telegram is ok')
            }

            const initUser = WebApp.initDataUnsafe?.user || { id: 999111, first_name: 'TestUser', username: 'test' };

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
                    if (data.user) loadCycleHistory(data.user.id)
                })
                .catch(e => console.error(e))
        }
    }, [])

    const loadCycleHistory = async (userId: string) => {
        try {
            const res = await fetch(`/api/cycle?userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setCycleHistory(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handlePeriodStart = async () => {
        if (!user) return;

        const dateToUse = new Date(selectedDate);
        const confirmMessage = `${dateToUse.toLocaleDateString('my-MM', { month: 'long', day: 'numeric', year: 'numeric' })} တွင် ရာသီ စတင်သည် ဟုတ်ပါသလား?`;

        if (WebApp.showConfirm) {
            WebApp.showConfirm(confirmMessage, async (confirmed) => {
                if (confirmed) {
                    setLoading(true)
                    try {
                        const res = await fetch('/api/cycle', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user.id, date: dateToUse })
                        })
                        const data = await res.json()
                        setLastCycle(data)
                        loadCycleHistory(user.id)
                        if (WebApp.HapticFeedback) WebApp.HapticFeedback.notificationOccurred('success')

                        if (WebApp.showAlert) {
                            WebApp.showAlert("ရာသီ စတင်ပြီ! (ပါတနာကို အသိပေးပြီးပါပြီ)")
                        }
                    } catch (e) {
                        console.error(e)
                        if (WebApp.showAlert) {
                            WebApp.showAlert("အမှားရှိသည်။ ထပ်စမ်းကြည့်ပါ။")
                        }
                    } finally {
                        setLoading(false)
                    }
                }
            })
        } else {
            if (confirm(confirmMessage)) {
                setLoading(true)
                try {
                    const res = await fetch('/api/cycle', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, date: dateToUse })
                    })
                    const data = await res.json()
                    setLastCycle(data)
                    loadCycleHistory(user.id)
                    alert("ရာသီ စတင်ပြီ! (ပါတနာကို အသိပေးပြီးပါပြီ)")
                } catch (e) {
                    console.error(e)
                    alert("အမှားရှိသည်။ ထပ်စမ်းကြည့်ပါ။")
                } finally {
                    setLoading(false)
                }
            }
        }
    }

    const deleteCycle = async (cycleId: string) => {
        if (!user) return;

        if (confirm("ဤ မှတ်တမ်း ဖျက်မှာ သေချာပါသလား?")) {
            try {
                const res = await fetch(`/api/cycle?id=${cycleId}`, {
                    method: 'DELETE'
                })
                if (res.ok) {
                    loadCycleHistory(user.id)
                    if (lastCycle?.id === cycleId) {
                        setLastCycle(null)
                    }
                    if (WebApp.showAlert) {
                        WebApp.showAlert('ဖျက်ပြီးပါပြီ!')
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    const generateCalendar = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const today = new Date(2026, 0, 8)

        const days = []

        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, className: '' })
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            let className = 'calendar-day'

            if (date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()) {
                className += ' today'
            }

            if (lastCycle && user) {
                const cycleStart = new Date(lastCycle.startDate)
                const daysSinceStart = Math.floor((date.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))

                if (daysSinceStart >= 0 && daysSinceStart < user.periodDuration) {
                    className += ' active'
                }

                const cyclesToCheck = 3;
                for (let c = 1; c <= cyclesToCheck; c++) {
                    const nextCycleStart = user.cycleLength * c;
                    if (daysSinceStart >= nextCycleStart && daysSinceStart < nextCycleStart + user.periodDuration) {
                        className += ' prediction'
                    }

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

    let daysLate = 0;
    let daysUntil = 0;
    let statusText = "မှတ်တမ်း မရှိပါ";
    let cycleDay = 1;

    if (lastCycle && user) {
        const start = new Date(lastCycle.startDate);
        const today = new Date(2026, 0, 8);
        const diffTime = today.getTime() - start.getTime();
        cycleDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + user.cycleLength);

        const diffNext = nextDate.getTime() - today.getTime();
        daysUntil = Math.ceil(diffNext / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            daysLate = Math.abs(daysUntil);
            statusText = `${daysLate} ရက် နောက်ကျနေသည်`;
        } else {
            statusText = `${daysUntil} ရက် ကျန်ရှိနေသေး`;
        }

        if (cycleDay <= user.periodDuration) {
            statusText = `ရာသီ ${cycleDay} ရက်မြောက်`;
        }
    }

    const monthName = currentMonth.toLocaleDateString('my-MM', { month: 'long', year: 'numeric' })

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>ရှာနေသည်...</div>

    return (
        <div className="container">
            <header style={{ marginBottom: '32px', marginTop: '16px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', textAlign: 'center' }}>🌸 ရာသီစက်ဝန်း မှတ်တမ်း</h1>
            </header>

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
                    <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '8px' }}>စက်ဝန်း ရက်စွဲ</span>
                    <span style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>{cycleDay}</span>
                    <span style={{ color: 'var(--primary-dark)', fontWeight: '500', marginTop: '8px' }}>{statusText}</span>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '16px' }}>
                <label>ရာသီ စတင်သည့် ရက်</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date(2026, 11, 31).toISOString().split('T')[0]}
                    style={{ width: '100%', marginBottom: 0 }}
                />
            </div>

            <button className="btn btn-primary" onClick={handlePeriodStart}>
                🩸 ရာသီ စတင် မှတ်တမ်းတင်မည်
            </button>

            <button className="btn btn-secondary" onClick={() => setShowHistory(!showHistory)} style={{ marginTop: '-4px' }}>
                📋 {showHistory ? 'ပြက္ခဒိန် ပြမည်' : 'မှတ်တမ်း ကြည့်မည်'}
            </button>

            {showHistory ? (
                <div className="card">
                    <h2>ရာသီ မှတ်တမ်းများ</h2>
                    {cycleHistory.length === 0 ? (
                        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>မှတ်တမ်း မရှိပါ</p>
                    ) : (
                        cycleHistory.map(cycle => (
                            <div key={cycle.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                borderBottom: '1px solid var(--border-color)',
                                marginBottom: '8px'
                            }}>
                                <span style={{ fontWeight: '500' }}>
                                    {new Date(cycle.startDate).toLocaleDateString('my-MM', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                <button
                                    onClick={() => deleteCycle(cycle.id)}
                                    style={{
                                        background: 'var(--danger)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    🗑️ ဖျက်မည်
                                </button>
                            </div>
                        ))
                    )}
                </div>
            ) : (
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
                        {['တ', 'တ', 'အ', 'ဗ', 'ကြ', 'သ', 'စ'].map((d, i) => <div key={i} className="day-header">{d}</div>)}
                        {generateCalendar().map((item, i) => (
                            <div key={i} className={item.className}>
                                {item.day || ''}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <BottomNav />
        </div>
    )
}
