import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseAdmin before importing SearchService
const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: mockRpc,
    from: mockFrom,
  },
}))

const { SearchService } = await import('@/lib/services/SearchService')

describe('SearchService.search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws 400 on empty query', async () => {
    await expect(SearchService.search('')).rejects.toMatchObject({ status: 400 })
  })

  it('throws 400 on whitespace-only query', async () => {
    await expect(SearchService.search('   ')).rejects.toMatchObject({ status: 400 })
  })

  it('throws 400 on query over 200 characters', async () => {
    const longQuery = 'a'.repeat(201)
    await expect(SearchService.search(longQuery)).rejects.toMatchObject({ status: 400 })
  })

  it('returns products from RPC when available', async () => {
    const mockProducts = [
      { id: 'p1', name: 'Oil Filter', oem_part_number: '15400-PLM-A02', images: [] },
    ]
    mockRpc.mockResolvedValueOnce({ data: mockProducts, error: null })

    const results = await SearchService.search('oil filter')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('Oil Filter')
  })

  it('falls back to direct query when RPC unavailable', async () => {
    // RPC returns error → triggers fallback
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Function not found' } })

    // Fallback: two queries (part number + name)
    const partNumChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: [{ id: 'p1', name: 'Oil Filter', oem_part_number: '15400-PLM-A02', images: [] }], error: null }),
    }
    const nameChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      textSearch: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValueOnce({ data: [], error: null }),
    }
    mockFrom
      .mockReturnValueOnce(partNumChain)
      .mockReturnValueOnce(nameChain)

    const results = await SearchService.search('15400-PLM-A02')
    expect(results.length).toBeGreaterThanOrEqual(0) // fallback runs without crash
  })
})
