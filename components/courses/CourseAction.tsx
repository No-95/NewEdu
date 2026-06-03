'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatVndPrice } from '@/lib/currency'

type CourseActionProps = {
  courseSlug: string
  isFree: boolean
  price: number
  hideContinueButton?: boolean
}

export default function CourseAction({ courseSlug, isFree, price, hideContinueButton = false }: CourseActionProps) {
  const [user, setUser] = useState<{ _id?: string; email?: string } | null>(null)
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
      } catch {
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
        body: JSON.stringify({ courseId: courseSlug, provider: 'payos', amount: price, currency: 'VND' }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create purchase')
      }
      const createJson = await createRes.json()
      const purchaseId = createJson.purchaseId

      const payosRes = await fetch('/api/purchase/payos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId }),
      })
      if (!payosRes.ok) {
        const err = await payosRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to start PayOS checkout')
      }
      const payosJson = await payosRes.json()
      const payUrl = payosJson.payUrl

      if (!payUrl) throw new Error('No payment URL')

      if (payUrl.startsWith('/api/purchase/notify')) {
        await fetch(payUrl)
        window.location.href = `/courses/${courseSlug}?paid=1`
        return
      }

      window.location.href = payUrl
    } catch (err) {
      console.error('Purchase error', err)
      alert(err instanceof Error ? err.message : 'Purchase failed')
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

  if (hasAccess && hideContinueButton) {
    return null
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      {hasAccess ? (
        <Link href={`/courses/${courseSlug}`} className="inline-flex items-center rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-white">Continue with this course</Link>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">{formatVndPrice(price)}</p>
          <Button onClick={handlePurchase} disabled={creating} className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            {creating ? 'Processing...' : 'Purchase this course'}
          </Button>
        </>
      )}
    </div>
  )
}
