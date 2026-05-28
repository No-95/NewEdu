"use client"

import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Camera, Check, Shield } from 'lucide-react'

type ProfileForm = {
  displayName: string
  username: string
  bio: string
  avatarUrl?: string | null
}

const initialProfile: ProfileForm = {
  displayName: 'Alex Johnson',
  username: 'alex.johnson',
  bio: 'Learning is a journey of continuous growth and discovery.',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
}

export default function ProfileClient(): React.ReactElement {
  const [form, setForm] = useState<ProfileForm>(initialProfile)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatarUrl ?? null)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  const MAX_BYTES = Number(process.env.NEXT_PUBLIC_PROFILE_AVATAR_MAX_BYTES) || 200000
  const MAX_WIDTH = 512
  const JPG_QUALITY = 0.78

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/profile/me')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted || !data) return
        setForm((s) => ({
          ...s,
          displayName: data.fullName ?? s.displayName,
          username: data.username ?? s.username,
          avatarUrl: data.avatarUrl ?? s.avatarUrl,
        }))
        setAvatarPreview(data.avatarUrl ?? null)
      } catch (err) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (field: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((s) => ({ ...s, [field]: e.target.value }))
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.toast({ title: 'Invalid file', description: 'Please select an image file.' })
      return
    }

    const compressAndSet = async (file: File) => {
      try {
        const dataUrl = await fileToDataUrl(file)
        if (dataUrl.length <= MAX_BYTES * 1.37) { // base64 overhead
          setAvatarPreview(dataUrl)
          setAvatarBase64(dataUrl)
          return
        }

        const compressed = await compressDataUrl(dataUrl, MAX_WIDTH, JPG_QUALITY)
        if (compressed.length > MAX_BYTES * 1.37) {
          toast.toast({ title: 'Image too large', description: 'Please choose a smaller image.' })
          return
        }
        setAvatarPreview(compressed)
        setAvatarBase64(compressed)
      } catch (err) {
        console.error('Image read/compress failed', err)
        toast.toast({ title: 'Image error', description: 'Could not process the image.' })
      }
    }

    compressAndSet(f)
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('File read error'))
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
  }

  const compressDataUrl = (dataUrl: string, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        try {
          const ratio = Math.min(1, maxWidth / img.width)
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * ratio)
          canvas.height = Math.round(img.height * ratio)
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas not supported'))
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const out = canvas.toDataURL('image/jpeg', quality)
          resolve(out)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Image load error'))
      img.src = dataUrl
    })
  }

  const handleSave = async () => {
    console.log('ProfileClient: handleSave start', { displayName: form.displayName, username: form.username })
    setIsSaving(true)
    try {
      const payload = {
        fullName: form.displayName,
        username: form.username,
        avatarBase64: avatarBase64 ?? undefined,
      }

      let res: Response | null = null
      try {
        res = await fetch('/api/profile/update', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (netErr) {
        console.error('ProfileClient: network error during save', netErr)
        toast.toast({ title: 'Network error', description: 'Could not reach server.' })
        return
      }

      if (!res.ok) {
        let msg = 'Failed to save profile'
        try {
          const err = await res.json()
          msg = err?.error || msg
        } catch (e) {
          console.error('ProfileClient: error parsing error body', e)
        }
        console.warn('ProfileClient: save failed', msg)
        toast.toast({ title: 'Error', description: msg })
        return
      }

      toast.toast({ title: 'Saved', description: 'Profile updated successfully.' })

      // refresh profile (best-effort)
      try {
        const me = await fetch('/api/profile/me')
        if (me.ok) {
          const data = await me.json()
          if (data) {
            setForm((s) => ({
              ...s,
              displayName: data.fullName ?? s.displayName,
              username: data.username ?? s.username,
              avatarUrl: data.avatarUrl ?? s.avatarUrl,
            }))
            setAvatarPreview(data.avatarUrl ?? avatarPreview)
          }
        }
      } catch (refreshErr) {
        console.warn('ProfileClient: could not refresh profile after save', refreshErr)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(initialProfile)
    setAvatarPreview(initialProfile.avatarUrl ?? null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section className="w-full max-w-4xl mx-auto bg-card border border-border rounded-lg p-4 sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <User className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Profile</h3>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Avatar (centered) */}
        <div className="sm:col-start-2 sm:col-span-1 flex justify-center items-start">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-2 ring-border shadow-sm bg-muted flex items-center justify-center">
              {avatarPreview ? (
                <Avatar className="w-full h-full">
                  <AvatarImage src={avatarPreview} alt={form.displayName} />
                  <AvatarFallback>{form.displayName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="text-muted-foreground">
                  <User className="h-10 w-10" />
                </div>
              )}
            </div>

            <label
              htmlFor="avatar"
              className="absolute inset-0 flex cursor-pointer items-end justify-center bg-black/0 group-hover:bg-black/20 transition-colors"
              aria-hidden
            >
              <div className="mb-3 hidden items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-sm text-muted-foreground shadow sm:flex">
                <Camera className="h-4 w-4" />
                <span>Change Photo</span>
              </div>
            </label>

            <input
              id="avatar"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFile}
            />
          </div>

          <div className="mt-3 w-full text-center">
            <p className="text-sm font-medium">{form.displayName}</p>
            <p className="text-xs text-muted-foreground">@{form.username}</p>
          </div>
        </div>

        {/* Form Column */}
        <div className="sm:col-span-2">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                <Input
                  id="displayName"
                  value={form.displayName}
                  onChange={handleChange('displayName')}
                  className="mt-1 w-full focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div>
                <Label htmlFor="username" className="text-sm">Username</Label>
                <div className="mt-1 flex items-center">
                  <span className="inline-flex items-center rounded-l-md border border-border bg-muted px-3 text-sm text-muted-foreground">@</span>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={handleChange('username')}
                    className="w-full rounded-l-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-sm">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={handleChange('bio')}
                rows={4}
                className="mt-1 w-full focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Short bio — what would you like others to know?"
              />
            </div>

            <div className="pt-2 border-t border-border flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:items-center">
              <Button type="button" variant="ghost" onClick={handleCancel} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Check className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
