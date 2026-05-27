"use client"
import React, { useState } from 'react'

export default function ConfigurationClient({ username }: { username?: string | null }) {
  const [tab, setTab] = useState<'configuration' | 'settings'>('configuration')

  const skylinkUrl = username ? `https://skylink.hdpedu.com/@${encodeURIComponent(username)}` : null

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-muted/40 rounded-md p-1">
          <button
            onClick={() => setTab('configuration')}
            className={`px-3 py-1 rounded-md text-sm ${tab === 'configuration' ? 'bg-white/10 text-primary' : 'text-muted-foreground'}`}>
            Configuration
          </button>
          <button
            onClick={() => setTab('settings')}
            className={`px-3 py-1 rounded-md text-sm ${tab === 'settings' ? 'bg-white/10 text-primary' : 'text-muted-foreground'}`}>
            Settings
          </button>
        </div>
        <div className="text-sm text-muted-foreground">Skylink</div>
      </div>

      <div className="mt-4">
        {tab === 'configuration' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Controls for linking your account to Skylink and public profile settings.</p>
            <div className="flex gap-2">
              <a
                className={`btn ${skylinkUrl ? 'bg-primary text-primary-foreground' : 'opacity-60 pointer-events-none'}`}
                href={skylinkUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
              >
                See Your Skylink
              </a>
              <a href="/dashboard#account" className="btn-outline">
                Edit Profile
              </a>
            </div>
            {!username && (
              <p className="text-sm text-yellow-600">You don't have a username yet — set one in Account to enable Skylink.</p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="font-semibold">Settings</h3>
            <p className="text-sm text-muted-foreground">Privacy, email preferences, and connected apps will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
