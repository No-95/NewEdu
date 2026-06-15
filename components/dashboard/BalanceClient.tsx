"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Plus, DollarSign, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

type Transaction = {
  id: string
  type: 'deposit' | 'purchase'
  amount: number
  description: string
  date: string
}

export default function BalanceClient(): React.ReactElement {
  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) return

    // Call server endpoint to perform deposit (uses Convex)
    fetch('/api/profile/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amt }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) {
          setBalance(data.balance)
          // refresh transactions
          void loadTransactions()
        }
      })
      .catch(() => {})
      .finally(() => {
        setDepositAmount('')
        setIsDialogOpen(false)
      })
  }

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const me = await fetch('/api/auth/me')
      if (!me.ok) return
      const user = await me.json()
      if (!user?.email) return

      // fetch transactions via our Next API
      const res = await fetch('/api/dashboard/transactions')
      if (!res.ok) return
      const payload = await res.json()
      const txs = (payload.transactions || []).map((t: any) => ({ id: t._id || t.id, type: t.type, amount: t.amount, description: t.description, date: new Date(t.createdAt).toISOString().slice(0,10) }))
      setTransactions(txs)

      // fetch latest full user record (includes balance)
      const profileRes = await fetch('/api/profile/me')
      if (profileRes.ok) {
        const p = await profileRes.json()
        if (p?.balance !== undefined) setBalance(p.balance)
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { void loadTransactions() }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className="text-3xl font-semibold mt-1">{balance !== null ? formatCurrency(balance) : '—'}</div>
              </div>

              <div className="flex items-center gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-primary text-primary-foreground"><Plus className="h-4 w-4"/> Deposit</Button>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-md">
                    <DialogHeader>
                      <DialogTitle>Deposit Funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <Input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount (USD)" type="number" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => { setDepositAmount(''); setIsDialogOpen(false) }}>Cancel</Button>
                        <Button onClick={handleDeposit}>Confirm</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" asChild>
                  <Link href="/contact-us?topic=withdraw&role=account">Withdraw</Link>
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Recent Transactions</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}
                            <span className="text-sm">{tx.type === 'deposit' ? 'Deposit' : 'Purchase'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{tx.description}</TableCell>
                        <TableCell className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">{tx.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">No saved cards</div>
              <div className="mt-4">
                <Button className="w-full" asChild>
                  <Link href="/contact-us?topic=payment-method&role=account">Add Card</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">View invoices and receipts</div>
              <div className="mt-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact-us?topic=billing&role=account">View Invoices</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
