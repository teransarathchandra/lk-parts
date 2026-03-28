import { OrderService } from '@/lib/services/OrderService'
import { NextRequest } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const order = await OrderService.getById(id)
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    // Server-side ownership check: caller must supply last 4 digits of the order phone.
    // Without this, any caller who guesses an order UUID can read customer PII.
    const phone_last4 = req.nextUrl.searchParams.get('phone_last4')
    if (phone_last4) {
      const stored = order.customer?.phone ?? order.shipping_address?.phone ?? ''
      const storedLast4 = stored.replace(/\D/g, '').slice(-4)
      if (!storedLast4 || phone_last4.replace(/\D/g, '') !== storedLast4) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 })
      }
    } else {
      // No phone provided — return non-PII status only so the status page can
      // show the verification form before revealing details.
      return Response.json({ id: order.id, status: order.status })
    }

    return Response.json(order)
  } catch {
    return Response.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
