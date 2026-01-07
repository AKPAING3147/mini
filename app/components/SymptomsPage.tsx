'use client'
import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import WebApp from '@twa-dev/sdk'

interface Symptom {
    id: string
    date: string
    mood: string | null
    pain: number | null
    flow: number | null
    note: string | null
}

const MOODS = ['😊 Happy', '😐 Neutral', '😔 Sad', '😤 Irritated', '😴 Tired']
const FLOW_LABELS = ['Light', 'Medium', 'Heavy']

export default function SymptomsPage() {
    const [userId, setUserId] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [mood, setMood] = useState('')
    const [pain, setPain] = useState(0)
    const [flow, setFlow] = useState(0)
    const [note, setNote] = useState('')
    const [symptoms, setSymptoms] = useState<Symptom[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
            const uid = String(WebApp.initDataUnsafe.user.id)
            setUserId(uid)
            loadSymptoms(uid)
        }
    }, [])

    const loadSymptoms = async (uid: string) => {
        try {
            const res = await fetch(`/api/symptoms?userId=${uid}`)
            if (res.ok) {
                const data = await res.json()
                setSymptoms(data)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const saveSymptom = async () => {
        if (!userId) return

        setLoading(true)
        try {
            const res = await fetch('/api/symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    date: selectedDate,
                    mood,
                    pain,
                    flow,
                    note
                })
            })

            if (res.ok) {
                const newSymptom = await res.json()
                setSymptoms([newSymptom, ...symptoms])

                if (WebApp.showAlert) {
                    WebApp.showAlert('Symptom logged!')
                } else {
                    alert('Symptom logged!')
                }

                // Reset form
                setMood('')
                setPain(0)
                setFlow(0)
                setNote('')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>📝 Daily Symptoms</h1>

            <div className="card">
                <label>Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ marginBottom: '16px' }}
                />

                <label>How are you feeling?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {MOODS.map(m => (
                        <div
                            key={m}
                            onClick={() => setMood(m)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '20px',
                                border: `2px solid ${mood === m ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: mood === m ? 'var(--primary)' : 'white',
                                color: mood === m ? 'white' : 'var(--text-color)',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {m}
                        </div>
                    ))}
                </div>

                <label>Pain Level: {pain}/10</label>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={pain}
                    onChange={(e) => setPain(Number(e.target.value))}
                    style={{ width: '100%', marginBottom: '16px' }}
                />

                <label>Flow Intensity</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {FLOW_LABELS.map((label, index) => (
                        <div
                            key={label}
                            onClick={() => setFlow(index + 1)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                textAlign: 'center',
                                borderRadius: '12px',
                                border: `2px solid ${flow === index + 1 ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: flow === index + 1 ? 'var(--primary)' : 'white',
                                color: flow === index + 1 ? 'white' : 'var(--text-color)',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {label}
                        </div>
                    ))}
                </div>

                <label>Notes</label>
                <textarea
                    placeholder="Any other symptoms or notes..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                />
            </div>

            <button className="btn btn-primary" onClick={saveSymptom} disabled={loading}>
                {loading ? 'Saving...' : 'Save Symptom Log'}
            </button>

            {/* Recent Symptoms */}
            {symptoms.length > 0 && (
                <div className="card">
                    <h2>Recent Logs</h2>
                    {symptoms.map(s => (
                        <div key={s.id} style={{
                            padding: '12px',
                            borderBottom: '1px solid var(--border-color)',
                            marginBottom: '8px'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {new Date(s.date).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {s.mood && <span>{s.mood} • </span>}
                                {s.pain && s.pain > 0 && <span>Pain: {s.pain}/10 • </span>}
                                {s.flow && s.flow > 0 && <span>Flow: {FLOW_LABELS[s.flow - 1]}</span>}
                            </div>
                            {s.note && <div style={{ fontSize: '0.85rem', marginTop: '4px', fontStyle: 'italic' }}>{s.note}</div>}
                        </div>
                    ))}
                </div>
            )}

            <BottomNav />
        </div>
    )
}
