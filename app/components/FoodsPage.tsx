'use client'
import { useState, useEffect } from 'react'
import BottomNav from './BottomNav'
import WebApp from '@twa-dev/sdk'

const PRESETS = ['🍫 ချောကလက်', '🍜 ဟင်းချို', '🍕 ပီဇာ', '🍔 ဘာဂါ', '🧋 ဘူဘယ်လ်တီး', '🍎 သစ်သီး', '🍦 ရေခဲမုန့်']

export default function FoodsPage() {
    const [foods, setFoods] = useState<string[]>([])
    const [note, setNote] = useState('')
    const [newFood, setNewFood] = useState('')
    const [userId, setUserId] = useState('')

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
                        setFoods(data.user.foodPreferences || [])
                        setNote(data.user.foodNote || '')
                    }
                })
        }
    }, [])

    const toggleFood = (food: string) => {
        if (foods.includes(food)) {
            setFoods(foods.filter(f => f !== food))
        } else {
            setFoods([...foods, food])
        }
    }

    const addCustom = () => {
        if (newFood && !foods.includes(newFood)) {
            setFoods([...foods, newFood])
            setNewFood('')
        }
    }

    const save = async () => {
        await fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({
                userId,
                foodPreferences: foods,
                foodNote: note
            })
        })

        if (WebApp.showAlert) {
            WebApp.showAlert('သိမ်းပြီးပါပြီ!')
        } else {
            alert('သိမ်းပြီးပါပြီ!')
        }
    }

    return (
        <div className="container">
            <h1>🍫 ကျွန်မ ကြိုက်တဲ့ အစားအစာများ</h1>

            <div className="card">
                <h2>ကျွန်မ ကြိုက်တာကတော့...</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PRESETS.map(f => (
                        <div
                            key={f}
                            onClick={() => toggleFood(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: `1px solid ${foods.includes(f) ? 'var(--primary-dark)' : 'var(--border-color)'}`,
                                background: foods.includes(f) ? 'var(--primary)' : 'transparent',
                                color: foods.includes(f) ? 'white' : 'var(--text-color)',
                                cursor: 'pointer'
                            }}
                        >
                            {f}
                        </div>
                    ))}
                </div>

                <div className="input-group" style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="အခြား အစားအစာ ထည့်မည်..."
                        value={newFood}
                        onChange={e => setNewFood(e.target.value)}
                        style={{ marginBottom: 0 }}
                    />
                    <button className="btn btn-primary" style={{ width: 'auto', marginBottom: 0 }} onClick={addCustom}>+</button>
                </div>
            </div>

            <div className="card">
                <label>ပါတနာအတွက် မှတ်ချက်</label>
                <textarea
                    placeholder="ဥပမာ - ပူပူလေး ယူလာပေးပါ..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <button className="btn btn-primary" onClick={save}>သိမ်းမည်</button>
            <BottomNav />
        </div>
    )
}
