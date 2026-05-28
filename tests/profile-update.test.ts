import { describe, it, expect, vi, beforeEach } from 'vitest'

// Ensure convex URL env for route
process.env.NEXT_PUBLIC_CONVEX_URL = 'http://test'

// Mock next/headers cookies
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'test@example.com' }) }),
}))

// Mock convex/browser ConvexHttpClient
const mockMutation = vi.fn().mockResolvedValue(true)
const mockQuery = vi.fn().mockResolvedValue({ _id: 'u1', email: 'test@example.com', fullName: 'Test User', username: 'test', avatarUrl: null })
vi.mock('convex/browser', () => ({
  ConvexHttpClient: function () {
    return { mutation: mockMutation, query: mockQuery }
  },
}))

// Mock generated api and anyApi
vi.mock('@/convex/_generated/api', () => ({ api: {} }))
vi.mock('convex/server', () => ({ anyApi: { auth: {} } }))

import { POST } from '../app/api/profile/update/route'

describe('POST /api/profile/update', () => {
  beforeEach(() => {
    mockMutation.mockClear()
    mockQuery.mockClear()
  })

  it('calls Convex mutation and query', async () => {
    const req = { json: async () => ({ username: 'newuser', fullName: 'New Name', avatarBase64: null }) } as any
    await POST(req)
    expect(mockMutation).toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalled()
  })
})
