import type { PaymentProvider } from './PaymentProvider'
import type {
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentWebhookResult,
  ReconcileResult,
} from '@/types'

export class CodPaymentProvider implements PaymentProvider {
  readonly name = 'cod' as const

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    // COD: no redirect. Reference is just the order ID.
    return {
      reference: `cod-${params.orderId}`,
    }
  }

  // COD has no webhook
  verifyWebhook(_payload: unknown, _signature: string): boolean {
    return true
  }

  processWebhook(_payload: unknown): PaymentWebhookResult {
    throw new Error('COD does not have webhooks')
  }

  async reconcile(orderId: string): Promise<ReconcileResult> {
    return {
      status: 'pending',
      details: `COD order ${orderId} requires manual admin confirmation`,
    }
  }
}
