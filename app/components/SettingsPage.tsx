'use client'
import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import WebApp from '@twa-dev/sdk'

export default function SettingsPage() {
    const [userId, setUserId] = useState('')
    const [cycleLength, setCycleLength] = useState(28)
    const [periodDuration, setPeriodDuration] = useState(5)
    const [partnerId, setPartnerId] = useState('')
    const [partnerEnabled, setPartnerEnabled] = useState(false)
    const [partnerMessage, setPartnerMessage] = useState('')

    useEffect(() => {
        if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
            const uid = String(WebApp.initDataUnsafe.user.id)
            setUserId(uid)

            fetch('/api/user', {
                method: 'POST',
                body: JSON.stringify(WebApp.initDataUnsafe.user)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setCycleLength(data.user.cycleLength)
                        setPeriodDuration(data.user.periodDuration)
                        setPartnerId(data.user.partnerId || '')
                        setPartnerEnabled(data.user.partnerEnabled || false)
                        setPartnerMessage(data.user.partnerMessage || '')
                    }
                })
        }
    }, [])

    const saveSettings = async () => {
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                cycleLength,
                periodDuration,
                partnerId,
                partnerEnabled,
                partnerMessage
            })
        })

        if (WebApp.showAlert) {
            WebApp.showAlert('Settings saved!')
        } else {
            alert('Settings saved!')
        }
    }

    return (
        <div className="container">
            <h1>⚙️ Settings</h1>

            {/* Cycle Settings */}
            <div className="card">
                <h2>Cycle Settings</h2>

                <label>Average Cycle Length (days)</label>
                <input
                    type="number"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    min="20"
                    max="45"
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px', marginBottom: '16px' }}>
                    Most women have cycles between 21-35 days. Default is 28 days.
                </p>

                <label>Period Duration (days)</label>
                <input
                    type="number"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(Number(e.target.value))}
                    min="2"
                    max="10"
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px' }}>
                    How many days does your period typically last? Default is 5 days.
                </p>
            </div>

            {/* Partner Notifications */}
            <div className="card">
                <h2>Partner Notifications</h2>

                <div className="switch-group">
                    <label style={{ marginBottom: 0 }}>Enable Notifications</label>
                    <input
                        type="checkbox"
                        checked={partnerEnabled}
                        onChange={(e) => setPartnerEnabled(e.target.checked)}
                        style={{ width: 'auto', marginBottom: 0 }}
                    />
                </div>

                <label>Partner Telegram ID</label>
                <input
                    type="text"
                    placeholder="e.g. 123456789"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px', marginBottom: '16px' }}>
                    Use <a href="https://t.me/userinfobot" target="_blank" style={{ color: 'var(--primary)' }}>@userinfobot</a> to get their ID
                </p>

                <label>Custom Message</label>
                <textarea
                    rows={4}
                    value={partnerMessage}
                    onChange={(e) => setPartnerMessage(e.target.value)}
                    placeholder="Hi ❤️ My period started today..."
                />
            </div>

            {/* About */}
            <div className="card">
                <h2>About</h2>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                    <strong>🌸 Cycle Tracker</strong> helps you track your menstrual cycle,
                    symptoms, and optionally notify your partner with care reminders.
                </p>
                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '12px' }}>
                    Version 1.0 • Made with ❤️
                </p>
            </div>

            <button className="btn btn-primary" onClick={saveSettings}>
                Save All Settings
            </button>

            <BottomNav />
        </div>
    )
}
