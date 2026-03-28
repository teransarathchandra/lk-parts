import { CartService } from '@/lib/services/CartService'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CART_COOKIE = 'lkp_cart'
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 48, // 48 hours
  path: '/',
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(CART_COOKIE)?.value

  const body = await request.json()
  const { product_id, quantity = 1 } = body

  if (!product_id) {
    return Response.json({ error: 'product_id is required' }, { status: 400 })
  }

  if (!token) {
    token = CartService.generateSessionToken()
  }

  try {
    const item = await CartService.addItem(token, product_id, quantity)
    const response = Response.json(item, { status: 201 })
    response.headers.set(
      'Set-Cookie',
      `${CART_COOKIE}=${token}; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_OPTS.maxAge}; Path=/`
    )
    return response
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Failed to add item'
    return Response.json({ error: message }, { status })
  }
}
