import type { PaymentProvider } from './PaymentProvider'
import type {
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentWebhookResult,
  ReconcileResult,
} from '@/types'
import { createHmac } from 'crypto'

const KOKO_API_URL = process.env.KOKO_API_URL ?? 'https://api.koko.lk/v1'
const KOKO_MERCHANT_ID = process.env.KOKO_MERCHANT_ID ?? ''
const KOKO_SECRET = process.env.KOKO_SECRET ?? ''
// Payment expiry window: 20 minutes
const KOKO_EXPIRY_MINUTES = 20

export class KokoPaymentProvider implements PaymentProvider {
  readonly name = 'koko' as const

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const reference = `lkp-${params.orderId}-${Date.now()}`
    const expiresAt = new Date(Date.now() + KOKO_EXPIRY_MINUTES * 60 * 1000)

    const payload = {
      merchant_id: KOKO_MERCHANT_ID,
      order_id: params.orderId,
      amount: params.amount,
      currency: params.currency,
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      customer_phone: params.customerPhone,
      reference,
    }

    const response = await fetch(`${KOKO_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KOKO_SECRET}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Koko API error: ${response.status} ${text}`)
    }

    const data = await response.json()

    return {
      redirectUrl: data.redirect_url,
      reference: data.reference ?? reference,
      expiresAt,
    }
  }

  /**
   * Verify Koko HMAC-SHA256 webhook signature.
   * Koko signs the raw payload body with KOKO_SECRET.
   */
  verifyWebhook(payload: unknown, signature: string): boolean {
    if (!KOKO_SECRET) return false
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
    const expected = createHmac('sha256', KOKO_SECRET)
      .update(body)
      .digest('hex')
    return expected === signature
  }

  processWebhook(payload: unknown): PaymentWebhookResult {
    const data = payload as Record<string, unknown>
    const status = data.status as string

    let resolvedStatus: 'completed' | 'failed' | 'refunded' = 'failed'
    if (status === 'completed' || status === 'success') resolvedStatus = 'completed'
    else if (status === 'refunded') resolvedStatus = 'refunded'

    return {
      orderId: data.order_id as string,
      status: resolvedStatus,
      providerReference: data.reference as string,
    }
  }

  async reconcile(orderId: string): Promise<ReconcileResult> {
    try {
      const response = await fetch(`${KOKO_API_URL}/payments/${orderId}`, {
        headers: { Authorization: `Bearer ${KOKO_SECRET}` },
      })
      if (!response.ok) {
        return { status: 'pending', details: `Koko API ${response.status}` }
      }
      const data = await response.json()
      return {
        status: data.status === 'completed' ? 'matched' : 'mismatch',
        details: JSON.stringify(data),
      }
    } catch (err) {
      return { status: 'pending', details: String(err) }
    }
  }
}
