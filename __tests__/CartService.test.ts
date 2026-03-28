import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockGt = vi.fn()
const mockLt = vi.fn()
const mockIn = vi.fn()

// Chainable builder
function chain(overrides: Record<string, unknown> = {}) {
  const obj: Record<string, unknown> = {
    select: vi.fn(() => obj),
    insert: vi.fn(() => obj),
    update: vi.fn(() => obj),
    delete: vi.fn(() => obj),
    eq: vi.fn(() => obj),
    gt: vi.fn(() => obj),
    lt: vi.fn(() => obj),
    in: vi.fn(() => obj),
    single: mockSingle,
    ...overrides,
  }
  return obj
}

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: mockFrom },
}))

vi.mock('crypto', () => ({ randomUUID: vi.fn(() => 'test-uuid-1234') }))

const { CartService } = await import('@/lib/services/CartService')

describe('CartService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('generateSessionToken', () => {
    it('returns a UUID string', () => {
      const token = CartService.generateSessionToken()
      expect(token).toBe('test-uuid-1234')
    })
  })

  describe('getOrCreate', () => {
    it('returns existing cart when found', async () => {
      const existingCart = { id: 'cart-1', session_token: 'tok', items: [] }
      const c = chain()
      c.single = vi.fn().mockResolvedValue({ data: existingCart, error: null })
      mockFrom.mockReturnValue(c)

      const result = await CartService.getOrCreate('tok')
      expect(result).toEqual(existingCart)
    })

    it('creates new cart when none exists', async () => {
      const newCart = { id: 'cart-new', session_token: 'tok2', items: [] }
      let callCount = 0
      mockFrom.mockImplementation(() => {
        const c = chain()
        c.single = vi.fn().mockResolvedValue(
          callCount++ === 0
            ? { data: null, error: null }   // no existing cart
            : { data: newCart, error: null } // new cart created
        )
        return c
      })

      const result = await CartService.getOrCreate('tok2')
      expect(result).toEqual(newCart)
    })

    it('throws when insert fails', async () => {
      let callCount = 0
      mockFrom.mockImplementation(() => {
        const c = chain()
        c.single = vi.fn().mockResolvedValue(
          callCount++ === 0
            ? { data: null, error: null }
            : { data: null, error: { message: 'DB error' } }
        )
        return c
      })

      await expect(CartService.getOrCreate('bad-tok')).rejects.toThrow('DB error')
    })
  })

  describe('getByToken', () => {
    it('returns null when cart not found (PGRST116)', async () => {
      const c = chain()
      c.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockFrom.mockReturnValue(c)

      const result = await CartService.getByToken('missing')
      expect(result).toBeNull()
    })

    it('throws on unexpected DB error', async () => {
      const c = chain()
      c.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'fail' } })
      mockFrom.mockReturnValue(c)

      await expect(CartService.getByToken('tok')).rejects.toThrow('fail')
    })
  })

  describe('cleanupExpired', () => {
    it('does nothing when no expired carts', async () => {
      const c = chain()
      // first call: select expired carts → empty
      c.single = vi.fn().mockResolvedValue({ data: [], error: null })
      const selectChain = { ...c, data: [], error: null }
      // make the whole chain resolve to empty array
      const finalChain = chain()
      Object.assign(finalChain, { then: undefined })
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          lt: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        delete: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ error: null }),
        }),
      })

      // Should complete without error
      await expect(CartService.cleanupExpired()).resolves.toBeUndefined()
    })
  })
})
