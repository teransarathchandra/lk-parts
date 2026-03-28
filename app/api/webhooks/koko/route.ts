import { NextRequest } from 'next/server'
import { KokoPaymentProvider } from '@/lib/providers/KokoPaymentProvider'
import { OrderService } from '@/lib/services/OrderService'
import { InventoryService } from '@/lib/services/InventoryService'
import { supabaseAdmin } from '@/lib/supabase'

const kokoProvider = new KokoPaymentProvider()

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-koko-signature') ?? ''

  // Verify HMAC signature
  if (!kokoProvider.verifyWebhook(rawBody, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data = payload as Record<string, unknown>
  const providerReference = data.reference as string

  // Idempotency: check if this reference was already processed
  const { data: existing } = await supabaseAdmin
    .from('payment_events')
    .select('id')
    .eq('provider_reference', providerReference)
    .eq('event_type', 'completed')
    .single()

  if (existing) {
    // Already processed — idempotent no-op
    return Response.json({ ok: true, idempotent: true })
  }

  try {
    const result = kokoProvider.processWebhook(payload)

    // Log webhook event
    await supabaseAdmin.from('payment_events').insert({
      order_id: result.orderId,
      provider: 'koko',
      event_type: 'webhook_received',
      provider_reference: providerReference,
      raw_payload: payload,
    })

    if (result.status === 'completed') {
      // Get order items for inventory confirmation
      const order = await OrderService.getById(result.orderId)
      if (order?.items) {
        for (const item of order.items) {
          await InventoryService.confirmReservation(item.product_id, item.quantity)
        }
      }

      await OrderService.updateStatus(result.orderId, 'paid', 'completed')

      await supabaseAdmin.from('payment_events').insert({
        order_id: result.orderId,
        provider: 'koko',
        event_type: 'completed',
        provider_reference: providerReference,
        raw_payload: payload,
      })
    } else if (result.status === 'failed') {
      // Release reservations
      const order = await OrderService.getById(result.orderId)
      if (order?.items) {
        for (const item of order.items) {
          await InventoryService.release(item.product_id, item.quantity)
        }
      }

      await OrderService.updateStatus(result.orderId, 'payment_failed', 'failed')

      await supabaseAdmin.from('payment_events').insert({
        order_id: result.orderId,
        provider: 'koko',
        event_type: 'failed',
        provider_reference: providerReference,
        raw_payload: payload,
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    // Log error event — don't crash, return 200 to prevent Koko retries on our bugs
    void supabaseAdmin.from('payment_events').insert({
      order_id: (payload as Record<string, unknown>).order_id,
      provider: 'koko',
      event_type: 'error',
      provider_reference: providerReference,
      raw_payload: { error: String(err), payload },
    })

    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
