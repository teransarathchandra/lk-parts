import { CartService } from '@/lib/services/CartService'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const CART_COOKIE = 'lkp_cart'

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value

  if (!token) {
    return Response.json({ error: 'No cart found' }, { status: 404 })
  }

  const body = await request.json()
  const { vehicle_id } = body

  try {
    await CartService.setVehicle(token, vehicle_id ?? null)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}
