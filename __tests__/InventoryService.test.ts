import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    rpc: mockRpc,
    from: mockFrom,
  },
}))

const { InventoryService } = await import('@/lib/services/InventoryService')

describe('InventoryService.reserve', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns true when reservation succeeds', async () => {
    mockRpc.mockResolvedValueOnce({ data: true, error: null })
    const result = await InventoryService.reserve('prod-1', 1)
    expect(result).toBe(true)
  })

  it('returns false when out of stock (0 rows returned)', async () => {
    mockRpc.mockResolvedValueOnce({ data: false, error: null })
    const result = await InventoryService.reserve('prod-1', 10)
    expect(result).toBe(false)
  })

  it('throws on DB error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })
    await expect(InventoryService.reserve('prod-1', 1)).rejects.toThrow('DB error')
  })
})

describe('InventoryService.release', () => {
  it('calls release_inventory RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null })
    await expect(InventoryService.release('prod-1', 2)).resolves.toBeUndefined()
    expect(mockRpc).toHaveBeenCalledWith('release_inventory', {
      p_product_id: 'prod-1',
      p_qty: 2,
    })
  })

  it('throws on DB error', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Release failed' } })
    await expect(InventoryService.release('prod-1', 1)).rejects.toThrow('Release failed')
  })
})

describe('InventoryService.confirmReservation', () => {
  it('calls confirm_inventory RPC', async () => {
    mockRpc.mockResolvedValueOnce({ data: null, error: null })
    await expect(InventoryService.confirmReservation('prod-1', 1)).resolves.toBeUndefined()
    expect(mockRpc).toHaveBeenCalledWith('confirm_inventory', {
      p_product_id: 'prod-1',
      p_qty: 1,
    })
  })
})
