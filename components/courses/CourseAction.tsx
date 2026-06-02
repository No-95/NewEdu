'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CourseAction({ courseSlug, isFree }: { courseSlug: string; isFree: boolean }) {
  const [user, setUser] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)
  const [hasAccess, setHasAccess] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true
    void (async () => {
      try {
        const res = await fetch('/api/profile/me', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setUser(data)

        if (data) {
          const accessRes = await fetch(`/api/purchase/has-access?courseId=${encodeURIComponent(courseSlug)}`, { cache: 'no-store' })
          if (accessRes.ok) {
            const json = await accessRes.json()
            if (mounted) setHasAccess(!!json.hasAccess)
          }
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [courseSlug])

  const handlePurchase = async () => {
    if (!user) {
      alert('Please sign in to purchase')
      return
    }

    setCreating(true)
    try {
      const createRes = await fetch('/api/purchase/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseSlug, provider: 'vnpay', amount: 100000, currency: 'VND' }),
      })
      const createJson = await createRes.json()
      const purchaseId = createJson.purchaseId

      const vnpayRes = await fetch('/api/purchase/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      })
      const vnpayJson = await vnpayRes.json()
      const payUrl = vnpayJson.payUrl

      if (!payUrl) throw new Error('No payment URL')

      if (payUrl.startsWith('/api/purchase/notify')) {
        await fetch(payUrl)
        window.location.href = `/courses/${courseSlug}`
        return
      }

      window.location.href = payUrl
    } catch (err) {
      console.error('Purchase error', err)
      alert('Purchase failed')
    } finally {
      setCreating(false)
    }
  }

  if (isFree) {
    return (
      <div className="mt-6 inline-flex items-center">
        <Link href={`/courses/${courseSlug}`} className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Start course</Link>
      </div>
    )
  }

  return (
    <div className="mt-6 inline-flex items-center">
      {hasAccess ? (
        <Link href={`/courses/${courseSlug}`} className="inline-flex items-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white">Continue with this course</Link>
      ) : (
        <Button onClick={handlePurchase} disabled={creating} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {creating ? 'Processing...' : 'Purchase this course'}
        </Button>
      )}
    </div>
  )
}
