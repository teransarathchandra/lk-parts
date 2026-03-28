import { OrderService } from '@/lib/services/OrderService'
import { CartService } from '@/lib/services/CartService'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const CART_COOKIE = 'lkp_cart'

const CreateOrderSchema = z.object({
  payment_method: z.enum(['cod', 'koko']),
  shipping_address: z.object({
    name: z.string().min(1),
    phone: z.string().min(9),
    address_line1: z.string().min(1),
    address_line2: z.string().optional(),
    city: z.string().min(1),
    district: z.string().min(1),
  }),
  delivery_notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  // Customer order history — requires customer_id from session (simplified)
  const customerId = request.headers.get('x-customer-id')
  if (!customerId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const orders = await OrderService.listForCustomer(customerId)
    return Response.json(orders)
  } catch {
    return Response.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'No cart found' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = CreateOrderSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    const cart = await CartService.getByToken(token)
    if (!cart || !cart.items || cart.items.length === 0) {
      return Response.json({ error: 'Cart is empty' }, { status: 422 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const { order, redirectUrl } = await OrderService.create(cart as Parameters<typeof OrderService.create>[0], {
      paymentMethod: parsed.data.payment_method,
      shippingAddress: parsed.data.shipping_address,
      deliveryNotes: parsed.data.delivery_notes,
      returnUrl: `${appUrl}/orders/${'{ORDER_ID}'}`, // replaced by service
      cancelUrl: `${appUrl}/cart`,
    })

    return Response.json({ order, redirect_url: redirectUrl }, { status: 201 })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Failed to create order'
    return Response.json({ error: message }, { status })
  }
}
