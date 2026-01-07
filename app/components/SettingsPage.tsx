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
    const [dailySymptomShare, setDailySymptomShare] = useState(false)

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
            WebApp.showAlert('ဆက်တင် သိမ်းပြီးပါပြီ!')
        } else {
            alert('ဆက်တင် သိမ်းပြီးပါပြီ!')
        }
    }

    return (
        <div className="container">
            <h1>⚙️ ဆက်တင်များ</h1>

            {/* Cycle Settings */}
            <div className="card">
                <h2>စက်ဝန်း ဆက်တင်</h2>

                <label>ပျမ်းမျှ စက်ဝန်း ကြာချိန် (ရက်)</label>
                <input
                    type="number"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    min="20"
                    max="45"
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px', marginBottom: '16px' }}>
                    အများစု ၂၁-၃၅ ရက် ကြာပါတယ်။ ပုံမှန်က ၂၈ ရက်။
                </p>

                <label>ရာသီ ကြာချိန် (ရက်)</label>
                <input
                    type="number"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(Number(e.target.value))}
                    min="2"
                    max="10"
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px' }}>
                    သင့် ရာသီ ပုံမှန် ဘယ်လောက် ကြာပါသလဲ? ပုံမှန်က ၅ ရက်။
                </p>
            </div>

            {/* Partner Notifications */}
            <div className="card">
                <h2>ပါတနာ အသိပေးချက်များ</h2>

                <div className="switch-group">
                    <label style={{ marginBottom: 0 }}>အသိပေးချက် ဖွင့်မည်</label>
                    <input
                        type="checkbox"
                        checked={partnerEnabled}
                        onChange={(e) => setPartnerEnabled(e.target.checked)}
                        style={{ width: 'auto', marginBottom: 0 }}
                    />
                </div>

                <div className="switch-group">
                    <label style={{ marginBottom: 0 }}>နေ့စဉ် လက္ခဏာ မျှဝေမည်</label>
                    <input
                        type="checkbox"
                        checked={dailySymptomShare}
                        onChange={(e) => setDailySymptomShare(e.target.checked)}
                        style={{ width: 'auto', marginBottom: 0 }}
                    />
                </div>

                <label>ပါတနာ၏ Telegram ID</label>
                <input
                    type="text"
                    placeholder="ဥပမာ - 123456789"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                />
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '-10px', marginBottom: '16px' }}>
                    <a href="https://t.me/userinfobot" target="_blank" style={{ color: 'var(--primary)' }}>@userinfobot</a> ကို သုံးပြီး ID ရယူပါ
                </p>

                <label>စာတိုအကြောင်းအရာ</label>
                <textarea
                    rows={4}
                    value={partnerMessage}
                    onChange={(e) => setPartnerMessage(e.target.value)}
                    placeholder="ကျွန်မ ရာသီ စတင်ပါပြီ..."
                />
            </div>

            {/* About */}
            <div className="card">
                <h2>အကြောင်း</h2>
                <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                    <strong>🌸 ရာသီစက်ဝန်း မှတ်တမ်း</strong> သည် သင့်ရာသီကို ခြေရာခံကာ လက္ခဏာများကို မှတ်တမ်းတင်ပြီး သင့်ပါတနာကို စောင့်ရှောက်မှု အသိပေးချက် ပို့ပေးနိုင်ပါသည်။
                </p>
                <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '12px' }}>
                    ဗားရှင်း 1.0 • Made by AKP ❤️
                </p>
            </div>

            <button className="btn btn-primary" onClick={saveSettings}>
                အားလုံး သိမ်းမည်
            </button>

            <BottomNav />
        </div>
    )
}
