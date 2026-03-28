import { CartService } from '@/lib/services/CartService'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CART_COOKIE = 'lkp_cart'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'No cart found' }, { status: 404 })
  }

  try {
    await CartService.removeItem(token, productId)
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}
