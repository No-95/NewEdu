"use client"

import React, { useRef, useState, useEffect, ChangeEvent } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'
import { User, Camera, Check, Shield } from 'lucide-react'

type ProfileForm = {
  displayName: string
  username: string
  bio: string
  avatarUrl?: string | null
  email?: string | null
  title?: string | null
  website?: string | null
  githubUrl?: string | null
  twitterHandle?: string | null
  linkedinUrl?: string | null
}

const initialProfile: ProfileForm = {
  displayName: 'Alex Johnson',
  username: 'alex.johnson',
  bio: 'Learning is a journey of continuous growth and discovery.',
  avatarUrl: null,
  email: null,
  title: null,
  website: null,
  githubUrl: null,
  twitterHandle: null,
  linkedinUrl: null,
}

export default function ProfileClient(): React.ReactElement {
  const [form, setForm] = useState<ProfileForm>(initialProfile)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatarUrl ?? null)
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [debugMsg, setDebugMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const toast = useToast()

  const MAX_BYTES = Number(process.env.NEXT_PUBLIC_PROFILE_AVATAR_MAX_BYTES) || 200000
  const MAX_WIDTH = 512
  const JPG_QUALITY = 0.78

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/profile/me', { credentials: 'same-origin', cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!mounted || !data) return
        setForm((s) => ({
          ...s,
          displayName: data.fullName ?? s.displayName,
          username: data.username ?? s.username,
          avatarUrl: data.avatarUrl ?? s.avatarUrl,
          email: data.email ?? s.email,
          title: data.title ?? s.title,
          website: data.website ?? s.website,
          githubUrl: data.githubUrl ?? s.githubUrl,
          twitterHandle: data.twitterHandle ?? s.twitterHandle,
          linkedinUrl: data.linkedinUrl ?? s.linkedinUrl,
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
    setDebugMsg('handleSave start')
    setIsSaving(true)
    try {
      const payload = {
        fullName: form.displayName,
        username: form.username,
        avatarBase64: avatarBase64 ?? undefined,
        title: form.title ?? undefined,
        website: form.website ?? undefined,
        githubUrl: form.githubUrl ?? undefined,
        twitterHandle: form.twitterHandle ?? undefined,
        linkedinUrl: form.linkedinUrl ?? undefined,
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
        setDebugMsg(`save failed: ${msg}`)
        return
      }

      toast.toast({ title: 'Saved', description: 'Profile updated successfully.' })
      setDebugMsg('save ok, refreshing profile...')

      // refresh profile (best-effort)
      try {
        const me = await fetch('/api/profile/me', { credentials: 'same-origin', cache: 'no-store' })
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
            setDebugMsg(`refreshed: ${JSON.stringify({ fullName: data.fullName, username: data.username, avatarUrl: !!data.avatarUrl })}`)
          }
        }
      } catch (refreshErr) {
        console.warn('ProfileClient: could not refresh profile after save', refreshErr)
        setDebugMsg(`refresh error: ${String(refreshErr)}`)
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    } catch (err) {
      console.warn('Logout failed', err)
    } finally {
      window.location.href = '/'
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto glow-edge bg-zinc-900/60 rounded-xl border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <CardHeader className="flex items-start justify-between gap-4 py-6">
        <div>
          <CardTitle className="text-2xl tracking-tight">Profile</CardTitle>
          <CardDescription className="text-sm text-zinc-400">Manage your personal information and avatar.</CardDescription>
        </div>
        <CardAction>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleCancel} className="text-zinc-400 hover:text-zinc-200 transition-all duration-200">Cancel</Button>
            <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-200 transition-all duration-200">Log out</Button>
            <Button onClick={handleSave} className="flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-800/90 transition-all duration-200 rounded-lg">
              <Check className="h-4 w-4" />
              <span className="text-sm">{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-1 flex flex-col items-center">
            <div className="relative">
              <div className="w-36 h-36 rounded-full overflow-hidden ring-1 ring-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] bg-zinc-800 flex items-center justify-center">
                {avatarPreview ? (
                  <Avatar className="w-full h-full">
                    <AvatarImage src={avatarPreview} alt={form.displayName} />
                    <AvatarFallback className="bg-zinc-700 text-zinc-200">{form.displayName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="text-zinc-500">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>

              <label htmlFor="avatar" className="absolute -bottom-2 right-0 inline-flex items-center gap-2 rounded-md bg-zinc-800/70 px-2 py-1 text-xs text-zinc-200 border border-white/6 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]">
                <Camera className="h-4 w-4" />
                <span>Change</span>
              </label>
              <input id="avatar" ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm font-semibold text-white tracking-tight">{form.displayName}</p>
              <p className="text-xs text-zinc-400">@{form.username}</p>
            </div>
          </div>

          <div className="sm:col-span-2">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="displayName" className="text-sm text-zinc-300">Display Name</Label>
                  <div className="mt-1">
                    <Input id="displayName" value={form.displayName} onChange={handleChange('displayName')} className="input-edge bg-zinc-800 text-white" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="username" className="text-sm text-zinc-300">Username</Label>
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center rounded-l-md border border-white/6 bg-zinc-800 px-3 text-sm text-zinc-400">@</span>
                    <div className="flex-1">
                      <Input id="username" value={form.username} onChange={handleChange('username')} className="input-edge w-full rounded-l-none bg-zinc-800 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="title" className="text-sm text-zinc-300">Title</Label>
                  <div className="mt-1">
                    <Input id="title" value={form.title ?? ''} onChange={handleChange('title')} className="input-edge bg-zinc-800 text-white" placeholder="e.g., Product Designer" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm text-zinc-300">Website</Label>
                  <div className="mt-1">
                    <Input id="website" value={form.website ?? ''} onChange={handleChange('website')} className="input-edge bg-zinc-800 text-white" placeholder="https://" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="githubUrl" className="text-sm text-zinc-300">GitHub</Label>
                  <div className="mt-1">
                    <Input id="githubUrl" value={form.githubUrl ?? ''} onChange={handleChange('githubUrl')} className="input-edge bg-zinc-800 text-white" placeholder="username" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="twitterHandle" className="text-sm text-zinc-300">Twitter</Label>
                  <div className="mt-1">
                    <Input id="twitterHandle" value={form.twitterHandle ?? ''} onChange={handleChange('twitterHandle')} className="input-edge bg-zinc-800 text-white" placeholder="@handle" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="linkedinUrl" className="text-sm text-zinc-300">LinkedIn</Label>
                  <div className="mt-1">
                    <Input id="linkedinUrl" value={form.linkedinUrl ?? ''} onChange={handleChange('linkedinUrl')} className="input-edge bg-zinc-800 text-white" placeholder="profile URL" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm text-zinc-300">Bio</Label>
                <div className="mt-1">
                  <Textarea id="bio" value={form.bio} onChange={handleChange('bio')} rows={4} className="input-edge bg-zinc-800 text-white" placeholder="Short bio — what would you like others to know?" />
                </div>
              </div>

              {debugMsg && (
                <div className="mt-2 p-2 text-xs text-zinc-300 bg-zinc-800 rounded">Debug: {debugMsg}</div>
              )}
            </form>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel} className="text-zinc-400 hover:text-zinc-200">Cancel</Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-zinc-800 text-white hover:bg-zinc-800/90 transition-all duration-200 rounded-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm">{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
