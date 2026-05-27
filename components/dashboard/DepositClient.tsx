"use client"
import React, { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function DepositClient() {
  const [balance, setBalance] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setBalance(data.balance ?? 0)
      } catch (e) {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  const doDeposit = async () => {
    const n = Number(amount)
    if (isNaN(n) || n <= 0) return toast.toast({ title: 'Invalid amount' })
    setLoading(true)
    try {
      const res = await fetch('/api/profile/deposit', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: n }),
      })
      if (!res.ok) throw new Error('Deposit failed')
      const data = await res.json()
      setBalance(data.balance)
      setAmount('')
      toast.toast({ title: 'Deposit successful', description: `Balance: ${data.balance}` })
    } catch (e) {
      toast.toast({ title: 'Error', description: (e as Error).message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm text-muted-foreground">Current balance</div>
        <div className="text-2xl font-semibold">{balance ?? '—'} USD</div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Deposit amount (USD)</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input mt-1 w-full"
          placeholder="e.g. 10"
        />
      </div>

      <div>
        <button className="btn" onClick={doDeposit} disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  )
}
