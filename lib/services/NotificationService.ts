/**
 * Phase 1: wa.me deep link generator (admin-triggered, no API).
 * Phase 2: swap to WhatsApp Business API via NotificationProvider interface.
 */
import { generateWhatsAppLink } from '@/lib/utils/phone'
import type { Order } from '@/types'

export class NotificationService {
  static generateOrderConfirmedLink(order: Order): string | null {
    const phone = order.customer?.phone
    if (!phone) return null

    const message = [
      `Hi ${order.customer?.name ?? 'there'}!`,
      `Your order #${order.id.slice(0, 8).toUpperCase()} from LK Parts has been confirmed.`,
      `Total: LKR ${order.total.toLocaleString()}`,
      `We'll update you when it's shipped.`,
    ].join('\n')

    return generateWhatsAppLink(phone, message)
  }

  static generateOrderShippedLink(order: Order): string | null {
    const phone = order.customer?.phone
    if (!phone) return null

    const message = [
      `Hi ${order.customer?.name ?? 'there'}!`,
      `Your order #${order.id.slice(0, 8).toUpperCase()} from LK Parts is on the way!`,
      `You'll receive it shortly.`,
    ].join('\n')

    return generateWhatsAppLink(phone, message)
  }

  static generateCustomerSupportLink(
    phone: string,
    orderId?: string,
    vehicleSlug?: string,
    productName?: string
  ): string {
    const parts = ['Hi, I need help']
    if (orderId) parts.push(`with order #${orderId.slice(0, 8).toUpperCase()}`)
    if (vehicleSlug) parts.push(`for my ${vehicleSlug.replace(/-/g, ' ')}`)
    if (productName) parts.push(`regarding ${productName}`)
    parts.push('.')

    const supportPhone = process.env.SUPPORT_WHATSAPP_PHONE ?? ''
    return generateWhatsAppLink(supportPhone, parts.join(' '))
  }
}
