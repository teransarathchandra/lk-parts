import { CartService } from '@/lib/services/CartService'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CART_COOKIE = 'lkp_cart'

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value

  if (!token) {
    return Response.json({ cart: null, items: [] })
  }

  try {
    const cart = await CartService.getByToken(token)
    return Response.json(cart ?? { cart: null, items: [] })
  } catch {
    return Response.json({ error: 'Failed to load cart' }, { status: 500 })
  }
}
