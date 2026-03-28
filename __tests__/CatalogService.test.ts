import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: mockFrom },
}))

function chain(terminal: unknown) {
  const obj: Record<string, unknown> = {
    select: vi.fn(() => obj),
    eq: vi.fn(() => obj),
    order: vi.fn(() => obj),
    in: vi.fn(() => obj),
    not: vi.fn(() => obj),
    is: vi.fn(() => obj),
    range: vi.fn(() => obj),
    single: vi.fn().mockResolvedValue(terminal),
  }
  // make the chain itself awaitable (resolves at end of chain)
  Object.assign(obj, terminal)
  return obj
}

const { CatalogService } = await import('@/lib/services/CatalogService')

describe('CatalogService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('listVehicles', () => {
    it('returns vehicles on success', async () => {
      const vehicles = [{ id: 'v1', slug: 'honda-civic-2020', is_active: true }]
      mockFrom.mockReturnValue(chain({ data: vehicles, error: null }))

      const result = await CatalogService.listVehicles()
      expect(result).toEqual(vehicles)
    })

    it('returns empty array when data is null', async () => {
      mockFrom.mockReturnValue(chain({ data: null, error: null }))

      const result = await CatalogService.listVehicles()
      expect(result).toEqual([])
    })

    it('throws on DB error', async () => {
      mockFrom.mockReturnValue(chain({ data: null, error: { message: 'connection failed' } }))

      await expect(CatalogService.listVehicles()).rejects.toThrow('connection failed')
    })
  })

  describe('getVehicleBySlug', () => {
    it('returns vehicle when found', async () => {
      const vehicle = { id: 'v1', slug: 'honda-civic-2020' }
      const c = chain({ data: null, error: null })
      c.single = vi.fn().mockResolvedValue({ data: vehicle, error: null })
      mockFrom.mockReturnValue(c)

      const result = await CatalogService.getVehicleBySlug('honda-civic-2020')
      expect(result).toEqual(vehicle)
    })

    it('returns null when not found (PGRST116)', async () => {
      const c = chain({ data: null, error: null })
      c.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      mockFrom.mockReturnValue(c)

      const result = await CatalogService.getVehicleBySlug('missing-slug')
      expect(result).toBeNull()
    })

    it('throws on unexpected DB error', async () => {
      const c = chain({ data: null, error: null })
      c.single = vi.fn().mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'db error' } })
      mockFrom.mockReturnValue(c)

      await expect(CatalogService.getVehicleBySlug('slug')).rejects.toThrow('db error')
    })
  })
})
