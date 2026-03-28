import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

// We test verifyWebhook and processWebhook without hitting the real Koko API.

// Set env before importing
vi.stubEnv('KOKO_SECRET', 'test-secret-key')
vi.stubEnv('KOKO_MERCHANT_ID', 'test-merchant')
vi.stubEnv('KOKO_API_URL', 'https://api.koko.lk/v1')

const { KokoPaymentProvider } = await import('@/lib/providers/KokoPaymentProvider')

const provider = new KokoPaymentProvider()

function makeSignature(payload: string, secret = 'test-secret-key'): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

describe('KokoPaymentProvider.verifyWebhook', () => {
  it('returns true for valid HMAC signature', () => {
    const payload = JSON.stringify({ order_id: 'ord-1', status: 'completed' })
    const sig = makeSignature(payload)
    expect(provider.verifyWebhook(payload, sig)).toBe(true)
  })

  it('returns false for invalid signature', () => {
    const payload = JSON.stringify({ order_id: 'ord-1', status: 'completed' })
    expect(provider.verifyWebhook(payload, 'bad-sig')).toBe(false)
  })
})

describe('KokoPaymentProvider.processWebhook', () => {
  it('maps "completed" status correctly', () => {
    const payload = {
      order_id: 'ord-1',
      status: 'completed',
      reference: 'koko-ref-123',
    }
    const result = provider.processWebhook(payload)
    expect(result.status).toBe('completed')
    expect(result.orderId).toBe('ord-1')
    expect(result.providerReference).toBe('koko-ref-123')
  })

  it('maps "success" status to completed', () => {
    const payload = { order_id: 'ord-2', status: 'success', reference: 'ref-2' }
    expect(provider.processWebhook(payload).status).toBe('completed')
  })

  it('maps unknown status to failed', () => {
    const payload = { order_id: 'ord-3', status: 'declined', reference: 'ref-3' }
    expect(provider.processWebhook(payload).status).toBe('failed')
  })

  it('maps "refunded" status correctly', () => {
    const payload = { order_id: 'ord-4', status: 'refunded', reference: 'ref-4' }
    expect(provider.processWebhook(payload).status).toBe('refunded')
  })
})
