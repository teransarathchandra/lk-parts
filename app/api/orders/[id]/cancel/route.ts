import { OrderService } from '@/lib/services/OrderService'
import { NextRequest } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Server-side ownership check before allowing cancellation.
  let phone_last4: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    phone_last4 = body?.phone_last4
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!phone_last4) {
    return Response.json({ error: 'phone_last4 required' }, { status: 400 })
  }

  try {
    const order = await OrderService.getById(id)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const stored = order.customer?.phone ?? order.shipping_address?.phone ?? ''
    const storedLast4 = stored.replace(/\D/g, '').slice(-4)
    if (!storedLast4 || phone_last4.replace(/\D/g, '') !== storedLast4) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const cancelled = await OrderService.cancel(id)
    return Response.json(cancelled)
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Failed to cancel order'
    return Response.json({ error: message }, { status })
  }
}
