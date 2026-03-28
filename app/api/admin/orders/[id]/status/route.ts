import { OrderService } from '@/lib/services/OrderService'
import { InventoryService } from '@/lib/services/InventoryService'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const StatusSchema = z.object({
  status: z.enum([
    'created', 'payment_initiated', 'paid', 'cod_confirmed',
    'processing', 'shipped', 'delivered', 'closed',
    'payment_failed', 'return_requested', 'return_approved',
    'refund_initiated', 'returned', 'cancelled',
  ]),
  payment_status: z.enum(['pending', 'initiated', 'completed', 'failed', 'refunded']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = StatusSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    // If confirming COD payment, confirm inventory
    if (parsed.data.status === 'cod_confirmed' || parsed.data.status === 'processing') {
      const order = await OrderService.getById(id)
      if (order?.items && order.status === 'cod_confirmed') {
        for (const item of order.items) {
          await InventoryService.confirmReservation(item.product_id, item.quantity)
        }
      }
    }

    const order = await OrderService.updateStatus(id, parsed.data.status, parsed.data.payment_status)
    return Response.json(order)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update status'
    return Response.json({ error: message }, { status: 500 })
  }
}
