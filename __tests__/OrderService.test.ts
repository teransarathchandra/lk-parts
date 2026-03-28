import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabaseAdmin
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: { from: mockFrom },
}))

// Mock InventoryService
const mockReserve = vi.fn()
const mockRelease = vi.fn()
vi.mock('@/lib/services/InventoryService', () => ({
  InventoryService: {
    reserve: mockReserve,
    release: mockRelease,
  },
}))

// Mock KokoPaymentProvider
const mockKokoInitiate = vi.fn()
vi.mock('@/lib/providers/KokoPaymentProvider', () => ({
  KokoPaymentProvider: class {
    initiatePayment = mockKokoInitiate
  },
}))

// Mock CodPaymentProvider
const mockCodInitiate = vi.fn()
vi.mock('@/lib/providers/CodPaymentProvider', () => ({
  CodPaymentProvider: class {
    initiatePayment = mockCodInitiate
  },
}))

const { OrderService } = await import('@/lib/services/OrderService')

// Minimal cart fixture
const baseCart = {
  id: 'cart-1',
  session_token: 'sess-tok',
  vehicle_id: null,
  vehicle: null,
  customer_id: null,
  expires_at: new Date(Date.now() + 3600000).toISOString(),
  items: [
    {
      id: 'ci-1',
      cart_id: 'cart-1',
      product_id: 'prod-1',
      quantity: 2,
      product: {
        id: 'prod-1',
        name: 'Oil Filter',
        price: 1500,
        fitment_type: 'universal',
        oem_part_number: 'OEM-123',
        images: [],
      },
    },
  ],
}

const baseShipping = {
  name: 'Kamal Perera',
  phone: '+94771234567',
  address_line1: '10 Galle Rd',
  city: 'Colombo',
  district: 'Colombo',
  postal_code: '00100',
}

function makeDbChain(result: unknown) {
  const c: Record<string, unknown> = {
    insert: vi.fn(() => c),
    select: vi.fn(() => c),
    update: vi.fn(() => c),
    delete: vi.fn(() => c),
    eq: vi.fn(() => c),
    in: vi.fn(() => c),
    single: vi.fn().mockResolvedValue(result),
    // make chain itself awaitable for non-.single() calls
    then: (resolve: (v: unknown) => void) => resolve(result),
  }
  return c
}

describe('OrderService', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('create — validation', () => {
    it('throws 422 when cart is empty', async () => {
      const emptyCart = { ...baseCart, items: [] }
      await expect(
        OrderService.create(emptyCart as never, {
          paymentMethod: 'cod',
          shippingAddress: baseShipping,
        })
      ).rejects.toMatchObject({ status: 422 })
    })

    it('throws 422 when exact-fit product has no vehicle on cart', async () => {
      const cart = {
        ...baseCart,
        vehicle_id: null,
        items: [
          {
            ...baseCart.items[0],
            product: { ...baseCart.items[0].product, fitment_type: 'exact' },
          },
        ],
      }
      await expect(
        OrderService.create(cart as never, {
          paymentMethod: 'cod',
          shippingAddress: baseShipping,
        })
      ).rejects.toMatchObject({ status: 422 })
    })
  })

  describe('create — COD happy path', () => {
    it('creates order and returns it for COD payment', async () => {
      const createdOrder = { id: 'order-1', status: 'created', payment_method: 'cod', total: 3350 }
      const finalOrder = { ...createdOrder, status: 'cod_confirmed', items: [], customer: null }

      mockReserve.mockResolvedValue(true)
      // CodPaymentProvider is not mocked — it's a real class with no network calls

      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          const c = makeDbChain({ data: null, error: null })
          // .insert().select().single() → returns createdOrder
          // .update().eq() → resolves OK
          // .select().eq().single() (getById) → returns finalOrder
          let orderCallCount = 0
          ;(c.single as ReturnType<typeof vi.fn>).mockImplementation(() => {
            return orderCallCount++ === 0
              ? Promise.resolve({ data: createdOrder, error: null })
              : Promise.resolve({ data: finalOrder, error: null })
          })
          return c
        }
        // order_items, cart_items, payment_events — all just succeed
        return makeDbChain({ data: null, error: null })
      })

      const { order } = await OrderService.create(baseCart as never, {
        paymentMethod: 'cod',
        shippingAddress: baseShipping,
      })

      expect(order).toMatchObject({ id: 'order-1' })
      expect(mockReserve).toHaveBeenCalledOnce()
    })
  })

  describe('create — inventory reservation failure', () => {
    it('throws when inventory reserve returns false (out of stock)', async () => {
      // reserve returns false → triggers release loop, then throws
      mockReserve.mockResolvedValue(false)
      mockRelease.mockResolvedValue(undefined)

      await expect(
        OrderService.create(baseCart as never, {
          paymentMethod: 'cod',
          shippingAddress: baseShipping,
        })
      ).rejects.toThrow()
    })
  })
})
