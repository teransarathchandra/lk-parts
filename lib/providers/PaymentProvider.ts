import type {
  PaymentInitiateParams,
  PaymentInitiateResult,
  PaymentWebhookResult,
  ReconcileResult,
} from '@/types'

export interface PaymentProvider {
  readonly name: 'koko' | 'payhere' | 'cod'

  initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult>

  verifyWebhook(payload: unknown, signature: string): boolean

  processWebhook(payload: unknown): PaymentWebhookResult

  reconcile(orderId: string): Promise<ReconcileResult>
}
