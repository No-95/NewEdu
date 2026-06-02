"use client"

import { useState } from 'react'
import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { ParticleBackground } from '@/components/DarkmodeParticleBackground'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Edit2, Check, X, ArrowUpRight, ArrowDownLeft, Plus, DollarSign, BookOpen, CheckCircle, Clock, User, Wallet, Briefcase, BarChart3, Settings, Github, Twitter, Linkedin, Upload } from 'lucide-react'
import ProfileClient from '@/components/dashboard/ProfileClient'
import WorksSection from '@/components/dashboard/WorksSection'
import BalanceClient from '@/components/dashboard/BalanceClient'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProfileData {
  username: string
  email: string
  avatar: string
  quote: string
}

interface Transaction {
  id: string
  type: 'deposit' | 'purchase'
  amount: number
  description: string
  date: string
  courseTitle?: string
}

interface Homework {
  id: string
  courseTitle: string
  assignmentTitle: string
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
  dueDate: string
  modules: number
  completedModules: number
}

// Profile UI replaced by `ProfileClient` component (see components/dashboard/ProfileClient.tsx)

// ============================================================================
// BALANCE SECTION
// ============================================================================

function BalanceSection() {
  const [balance, setBalance] = useState(150.0)
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 100, description: 'Bank Transfer', date: '2024-05-20' },
    { id: '2', type: 'purchase', amount: -29.99, description: 'Course Purchase', courseTitle: 'React Advanced Patterns', date: '2024-05-18' },
    { id: '3', type: 'deposit', amount: 50, description: 'Referral Bonus', date: '2024-05-15' },
    { id: '4', type: 'purchase', amount: -20.01, description: 'Course Purchase', courseTitle: 'TypeScript Fundamentals', date: '2024-05-10' },
  ])
  const [depositAmount, setDepositAmount] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (amount > 0) {
      setBalance(balance + amount)
      setTransactions([
        { id: Date.now().toString(), type: 'deposit', amount, description: 'Bank Transfer', date: new Date().toISOString().split('T')[0] },
        ...transactions,
      ])
      setDepositAmount('')
      setIsDialogOpen(false)
    }
  }

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="text-foreground">Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">{formatCurrency(balance)}</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Deposit Funds</Button>
              </DialogTrigger>
              <DialogContent className="border border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Deposit Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-foreground">Amount (USD)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="amount" type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="pl-8" step="0.01" min="0" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleDeposit} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Confirm Deposit</Button>
                    <Button variant="outline" onClick={() => { setDepositAmount(''); setIsDialogOpen(false) }} className="flex-1">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground">Type</TableHead>
                  <TableHead className="text-foreground">Description</TableHead>
                  <TableHead className="text-foreground">Amount</TableHead>
                  <TableHead className="text-right text-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'deposit' ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.courseTitle && <p className="text-sm text-muted-foreground">{transaction.courseTitle}</p>}
                      </div>
                    </TableCell>
                    <TableCell className={`font-semibold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Your Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {homeworks.map((homework) => (
              <div
                key={homework.id}
                className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getStatusIcon(homework.status)}</div>
                    <div className="flex-1">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {homework.courseTitle}
                        </p>
                        <h3 className="font-semibold text-foreground text-base">
                          {homework.assignmentTitle}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(homework.status)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Progress: {homework.completedModules} of {homework.modules} modules
                      </p>
                      <p className="text-xs font-semibold text-foreground">{homework.progress}%</p>
                    </div>
                    <Progress value={homework.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">Due: {formatDate(homework.dueDate)}</p>
                    {homework.status !== 'completed' && (
                      <Button size="sm" variant="outline" className="text-xs">
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [username, setUsername] = useState('@alex_dev')
  const [fullName, setFullName] = useState('Alex Developer')
  const [githubUrl, setGithubUrl] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')

  const navItems = [
    { name: 'Profile', icon: User },
    { name: 'Balance', icon: Wallet },
    { name: 'Works', icon: Briefcase },
    { name: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-8">
        <div className="flex h-[calc(100vh-6rem)] bg-transparent shadow-sm rounded-md overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-card border border-border flex flex-col">
            <nav className="flex-1 px-3 py-4 overflow-auto">
              {navItems.map((item) => {
                const Icon = item.icon as any
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                      activeTab === item.name ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">

            <div className="max-w-7xl mx-auto px-6 py-6">
              {activeTab === 'Profile' && (
                <div className="grid grid-cols-1 gap-6">
                  <ProfileClient />
                </div>
              )}

              {activeTab === 'Balance' && (
                <BalanceClient />
              )}

              {activeTab === 'Works' && (
                <div className="space-y-6">
                  <WorksSection />
                </div>
              )}

              {activeTab === 'Analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="shadow-sm border-border">
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>Overview metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'Settings' && (
                <div>
                  <Card className="shadow-sm border-border">
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Account preferences</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
