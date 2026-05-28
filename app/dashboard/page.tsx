"use client"

import { useState } from 'react'
import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { ParticleBackground } from '@/components/ParticleBackground'
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
    </div>
  )
}

// ============================================================================
// WORKS SECTION
// ============================================================================

// Homeworks are loaded from Convex via /api/dashboard/homeworks

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
    case 'in-progress':
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">In Progress</Badge>
    case 'pending':
      return <Badge variant="outline">Pending</Badge>
    default:
      return null
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
    case 'in-progress':
      return <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    default:
      return <BookOpen className="h-5 w-5 text-muted-foreground" />
  }
}

function WorksSection() {
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/homeworks')
        if (!res.ok) return
        const payload = await res.json()
        const hw = (payload.homeworks || []).map((h: any) => ({
          id: h._id || h.id,
          courseTitle: h.courseId || 'Course',
          assignmentTitle: h.title || h.assignmentTitle || '',
          progress: 0,
          status: h.status === 'completed' ? 'completed' : h.status === 'in-progress' ? 'in-progress' : 'pending',
          dueDate: h.dueDate ? new Date(h.dueDate).toISOString().split('T')[0] : '',
          modules: 0,
          completedModules: 0,
        }))
        if (mounted) setHomeworks(hw)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!loading && homeworks.length === 0) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>No Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You got no homework, you're free for now.</p>
        </CardContent>
      </Card>
    )
  }

  const overallProgress = homeworks.length ? Math.round(homeworks.reduce((sum, hw) => sum + (hw.progress || 0), 0) / homeworks.length) : 0
  const completedCount = homeworks.filter(hw => hw.status === 'completed').length
  const inProgressCount = homeworks.filter(hw => hw.status === 'in-progress').length
  const pendingCount = homeworks.filter(hw => hw.status === 'pending').length

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
              <p className="text-xs text-muted-foreground">assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <div className="text-3xl font-bold text-muted-foreground">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Customization Panel */}
                  <div className="lg:col-span-2">
                    <Card className="shadow-sm border-border">
                      <CardHeader>
                        <CardTitle>Profile Customization</CardTitle>
                        <CardDescription>Update your profile information and social links</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Avatar Upload Section */}
                        <div className="flex items-start gap-6">
                          <div className="relative group">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src="" alt="Profile" />
                              <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                                AD
                              </AvatarFallback>
                            </Avatar>
                            <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Upload className="w-6 h-6 text-white" />
                            </button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <Label htmlFor="username">Current Username</Label>
                              <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1.5 border-border"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1.5 border-border"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Social Profiles Section */}
                        <div>
                          <h3 className="text-sm font-medium text-foreground mb-4">Social Profiles</h3>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="github" className="flex items-center gap-2 text-muted-foreground">
                                <Github className="w-4 h-4 text-muted-foreground" />
                                GitHub URL
                              </Label>
                              <Input
                                id="github"
                                placeholder="https://github.com/username"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="mt-1.5 border-border"
                              />
                            </div>
                            <div>
                              <Label htmlFor="twitter" className="flex items-center gap-2 text-muted-foreground">
                                <Twitter className="w-4 h-4 text-muted-foreground" />
                                X/Twitter Handle
                              </Label>
                              <Input
                                id="twitter"
                                placeholder="@username"
                                value={twitterHandle}
                                onChange={(e) => setTwitterHandle(e.target.value)}
                                className="mt-1.5 border-border"
                              />
                            </div>
                            <div>
                              <Label htmlFor="linkedin" className="flex items-center gap-2 text-muted-foreground">
                                <Linkedin className="w-4 h-4 text-muted-foreground" />
                                LinkedIn URL
                              </Label>
                              <Input
                                id="linkedin"
                                placeholder="https://linkedin.com/in/username"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                className="mt-1.5 border-border"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button className="w-full sm:w-auto">Save Changes</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Sidebar */}
                  <div className="space-y-6">
                    {/* Profile Status Card */}
                    <Card className="shadow-sm border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Profile Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Profile Completeness</span>
                            <span className="text-sm font-medium text-foreground">85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        <Button variant="outline" className="w-full">
                          Preview Profile
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Public View Summary Card */}
                    <Card className="shadow-sm border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Public View Summary</CardTitle>
                        <CardDescription className="text-xs">How others see your profile</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="" alt="Profile" />
                            <AvatarFallback className="bg-muted text-muted-foreground">
                              AD
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{fullName}</p>
                            <p className="text-sm text-muted-foreground">{username}</p>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Developer passionate about building great products
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
