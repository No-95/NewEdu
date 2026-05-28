import { describe, it, expect, vi } from 'vitest'

process.env.NEXT_PUBLIC_CONVEX_URL = 'http://test'

vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => ({ value: 'test@example.com' }) }),
}))

const mockQuery = vi.fn().mockResolvedValue({ _id: 'u1', email: 'test@example.com', fullName: 'Test User', username: 'test', avatarUrl: null })
vi.mock('convex/browser', () => ({
  ConvexHttpClient: function () {
    return { query: mockQuery }
  },
}))

vi.mock('@/convex/_generated/api', () => ({ api: {} }))
vi.mock('convex/server', () => ({ anyApi: { auth: {} } }))

import { GET } from '../app/api/profile/me/route'

describe('GET /api/profile/me', () => {
  it('queries Convex for user by email', async () => {
    const res = await GET()
    expect(mockQuery).toHaveBeenCalled()
  })
})
