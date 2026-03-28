import { OrderService } from '@/lib/services/OrderService'
import { NextRequest } from 'next/server'

// Admin auth: checked via middleware (is_admin flag on customer)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const orders = await OrderService.listForAdmin({ status, limit, offset })
    return Response.json(orders)
  } catch {
    return Response.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}
