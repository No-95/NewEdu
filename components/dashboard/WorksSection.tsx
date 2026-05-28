"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, BookOpen } from 'lucide-react'

type Homework = {
  id: string
  courseTitle: string
  assignmentTitle: string
  progress: number
  status: 'completed' | 'in-progress' | 'pending'
  dueDate: string
  modules: number
  completedModules: number
}

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

export default function WorksSection(): React.ReactElement {
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/dashboard/homeworks', { credentials: 'same-origin', cache: 'no-store' })
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
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (!loading && homeworks.length === 0) {
    return (
      <Card className="border border-border glow-edge">
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-border glow-edge">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
              <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border glow-edge">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedCount}</div>
              <p className="text-xs text-muted-foreground">assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border glow-edge">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
              <p className="text-xs text-muted-foreground">assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border glow-edge">
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
              <div key={homework.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getStatusIcon(homework.status)}</div>
                    <div className="flex-1">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{homework.courseTitle}</p>
                        <h3 className="font-semibold text-foreground text-base">{homework.assignmentTitle}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(homework.status)}</div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">Progress: {homework.completedModules} of {homework.modules} modules</p>
                      <p className="text-xs font-semibold text-foreground">{homework.progress}%</p>
                    </div>
                    <Progress value={homework.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">Due: {homework.dueDate}</p>
                    {homework.status !== 'completed' && (
                      <Button size="sm" variant="outline" className="text-xs">Continue</Button>
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
