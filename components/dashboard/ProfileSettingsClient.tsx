"use client"
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function ProfileSettingsClient() {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const toast = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        setUsername(data.fullName ?? data.username ?? '')
        setAvatarPreview(data.avatarUrl ?? null)
      } catch (e) {}
    })()
    return () => {
      mounted = false
    }
  }, [])

  const onFile = (f?: File) => {
    if (!f) return
    setAvatarFile(f)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(String(reader.result))
    reader.readAsDataURL(f)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let avatarBase64: string | undefined
      if (avatarFile) {
        const reader = await new Promise<string | null>((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(String(r.result))
          r.onerror = rej
          r.readAsDataURL(avatarFile)
        })
        avatarBase64 = reader ?? undefined
      }

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatarBase64 }),
      })

      if (!res.ok) throw new Error('Save failed')
      toast.toast({ title: 'Profile updated', description: 'Saved successfully.' })
    } catch (e) {
      toast.toast({ title: 'Error', description: (e as Error).message || 'Failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar>
          {avatarPreview ? (
            <AvatarImage src={avatarPreview} alt={username || 'Avatar'} />
          ) : (
            <AvatarFallback>{(username || 'U').charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <label className="text-sm text-muted-foreground block">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input mt-1 w-full"
            placeholder="Choose a username"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block">Profile photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="mt-2"
        />
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </div>
  )
}
