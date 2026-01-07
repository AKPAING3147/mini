'use client'
import { useState, useEffect } from 'react'
import BottomNav from './BottomNav'
import WebApp from '@twa-dev/sdk'

export default function PartnerPage() {
    const [config, setConfig] = useState({
        partnerId: '',
        partnerEnabled: false,
        partnerMessage: ''
    })
    const [userId, setUserId] = useState<string>('')

    useEffect(() => {
        if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
            const uid = String(WebApp.initDataUnsafe.user.id)
            setUserId(uid)
            // Fetch current settings
            fetch('/api/user', {
                method: 'POST',
                body: JSON.stringify(WebApp.initDataUnsafe.user)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setConfig({
                            partnerId: data.user.partnerId || '',
                            partnerEnabled: data.user.partnerEnabled || false,
                            partnerMessage: data.user.partnerMessage || ''
                        })
                    }
                })
        }
    }, [])

    const save = async () => {
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({ userId, ...config })
        })

        if (WebApp.showAlert) {
            WebApp.showAlert('Partner settings saved!')
        } else {
            alert('Partner settings saved!')
        }
    }

    return (
        <div className="container">
            <h1>❤️ Partner Settings</h1>

            <div className="card">
                <div className="switch-group">
                    <label>Enable Notifications</label>
                    <input
                        type="checkbox"
                        checked={config.partnerEnabled}
                        onChange={e => setConfig({ ...config, partnerEnabled: e.target.checked })}
                        style={{ width: 'auto' }}
                    />
                </div>

                <label>Partner Telegram ID</label>
                <input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={config.partnerId}
                    onChange={e => setConfig({ ...config, partnerId: e.target.value })}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-10px', marginBottom: '15px' }}>
                    Ask your partner to send <code>/start</code> to this bot, then forward you their ID.
                </p>

                <label>Notification Message</label>
                <textarea
                    rows={4}
                    value={config.partnerMessage}
                    onChange={e => setConfig({ ...config, partnerMessage: e.target.value })}
                />
            </div>

            <button className="btn btn-primary" onClick={save}>Save Settings</button>
            <BottomNav />
        </div>
    )
}
