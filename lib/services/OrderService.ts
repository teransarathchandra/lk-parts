import { supabaseAdmin } from '@/lib/supabase'
import { InventoryService } from './InventoryService'
import { KokoPaymentProvider } from '@/lib/providers/KokoPaymentProvider'
import { CodPaymentProvider } from '@/lib/providers/CodPaymentProvider'
import type {
  Cart,
  CartItem,
  Order,
  OrderItem,
  Product,
  PaymentMethod,
  ShippingAddress,
  FitmentSnapshot,
  Vehicle,
} from '@/types'

type CartItemWithProduct = Omit<CartItem, 'product'> & { product: Product }
// Cart parameter for order creation — items and product are guaranteed present
interface CartWithItems extends Omit<Cart, 'items'> {
  items: CartItemWithProduct[]
  vehicle?: Vehicle | null
}

const DELIVERY_FEE = Number(process.env.DELIVERY_FEE_LKR ?? 350)

export class OrderService {
  static async create(
    cart: CartWithItems,
    params: {
      paymentMethod: PaymentMethod
      shippingAddress: ShippingAddress
      deliveryNotes?: string
      returnUrl?: string
      cancelUrl?: string
    }
  ): Promise<{ order: Order; redirectUrl?: string }> {
    if (!cart.items || cart.items.length === 0) {
      throw Object.assign(new Error('Cart is empty'), { status: 422 })
    }

    // Validate fitment snapshots for exact-fit products
    for (const item of cart.items) {
      const fitmentType = item.product.fitment_type
      if (fitmentType === 'exact' && !cart.vehicle_id) {
        throw Object.assign(
          new Error(`Product "${item.product.name}" requires vehicle fitment context`),
          { status: 422 }
        )
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const total = subtotal + DELIVERY_FEE

    // Build order items with fitment snapshots
    const orderItemsPayload = cart.items.map((item) => {
      let fitmentSnapshot: FitmentSnapshot | null = null
      if (item.product.fitment_type === 'exact' && cart.vehicle_id) {
        fitmentSnapshot = {
          vehicle_id: cart.vehicle_id,
          vehicle_slug: cart.vehicle?.slug ?? '',
          fitment_type: 'exact',
          oem_part_number: item.product.oem_part_number,
          product_name: item.product.name,
          matched_at: new Date().toISOString(),
        }
      }
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        fitment_snapshot: fitmentSnapshot,
      }
    })

    // Atomic reservation: reserve all items before creating order
    const reservations: { productId: string; qty: number }[] = []
    try {
      for (const item of cart.items) {
        const reserved = await InventoryService.reserve(item.product_id, item.quantity)
        if (!reserved) {
          // Release previously reserved items
          for (const r of reservations) {
            await InventoryService.release(r.productId, r.qty).catch((e) => console.error('[lk-parts] inventory release failed:', e))
          }
          throw Object.assign(
            new Error(`"${item.product.name}" is out of stock`),
            { status: 409 }
          )
        }
        reservations.push({ productId: item.product_id, qty: item.quantity })
      }
    } catch (err) {
      throw err
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: cart.customer_id,
        status: 'created',
        payment_method: params.paymentMethod,
        payment_status: 'pending',
        subtotal,
        delivery_fee: DELIVERY_FEE,
        total,
        shipping_address: params.shippingAddress,
        delivery_notes: params.deliveryNotes ?? null,
      })
      .select()
      .single()

    if (orderError) {
      // Release reservations on order creation failure
      for (const r of reservations) {
        await InventoryService.release(r.productId, r.qty).catch((e) => console.error('[lk-parts] inventory release failed:', e))
      }
      throw new Error(orderError.message)
    }

    // Insert order items
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(
        orderItemsPayload.map((item) => ({ ...item, order_id: order.id }))
      )

    if (itemsError) {
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      for (const r of reservations) {
        await InventoryService.release(r.productId, r.qty).catch((e) => console.error('[lk-parts] inventory release failed:', e))
      }
      throw new Error(itemsError.message)
    }

    // Clear cart
    await supabaseAdmin.from('cart_items').delete().eq('cart_id', cart.id)

    // Initiate payment
    const provider =
      params.paymentMethod === 'koko'
        ? new KokoPaymentProvider()
        : new CodPaymentProvider()

    const customerPhone = params.shippingAddress.phone

    let redirectUrl: string | undefined

    if (params.paymentMethod === 'koko') {
      let result: Awaited<ReturnType<typeof provider.initiatePayment>>
      try {
        result = await provider.initiatePayment({
          orderId: order.id,
          amount: total,
          currency: 'LKR',
          returnUrl: params.returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
          cancelUrl: params.cancelUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
          customerPhone,
        })
      } catch {
        // Koko initiation failed — release reserved inventory and mark order failed
        for (const r of reservations) {
          await InventoryService.release(r.productId, r.qty).catch((e) => console.error('[lk-parts] inventory release failed:', e))
        }
        await supabaseAdmin
          .from('orders')
          .update({ status: 'payment_failed', payment_status: 'failed' })
          .eq('id', order.id)
        throw Object.assign(new Error('Payment initiation failed'), { status: 502 })
      }

      redirectUrl = result.redirectUrl

      // Update order status
      await supabaseAdmin
        .from('orders')
        .update({ status: 'payment_initiated', payment_status: 'initiated' })
        .eq('id', order.id)

      // Log payment event
      await supabaseAdmin.from('payment_events').insert({
        order_id: order.id,
        provider: 'koko',
        event_type: 'initiated',
        provider_reference: result.reference,
        raw_payload: result,
      })
    } else {
      // COD: mark as cod_confirmed pending admin
      await supabaseAdmin
        .from('orders')
        .update({ status: 'cod_confirmed', payment_status: 'pending' })
        .eq('id', order.id)

      await supabaseAdmin.from('payment_events').insert({
        order_id: order.id,
        provider: 'cod',
        event_type: 'initiated',
        provider_reference: `cod-${order.id}`,
        raw_payload: null,
      })
    }

    const updatedOrder = await this.getById(order.id)
    return { order: updatedOrder!, redirectUrl }
  }

  static async getById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, product:products(*)), customer:customers(*)')
      .eq('id', orderId)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data ?? null
  }

  static async listForCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, product:products(id, name, slug, images))')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async listForAdmin(options: {
    status?: string
    limit?: number
    offset?: number
  } = {}): Promise<Order[]> {
    let query = supabaseAdmin
      .from('orders')
      .select('*, customer:customers(*), items:order_items(*, product:products(id, name, slug))')
      .order('created_at', { ascending: false })
      .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50) - 1)

    if (options.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async updateStatus(
    orderId: string,
    status: string,
    paymentStatus?: string
  ): Promise<Order> {
    const update: Record<string, string> = { status }
    if (paymentStatus) update.payment_status = paymentStatus

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(update)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async cancel(orderId: string): Promise<Order> {
    // Verify order exists and get its items for inventory release
    const order = await this.getById(orderId)
    if (!order) throw new Error('Order not found')

    const cancellableStatuses = ['created', 'cod_confirmed', 'payment_initiated']

    // Atomic status transition: only cancels if status is still cancellable.
    // Prevents double-cancel + double inventory release under concurrent requests.
    const { data: cancelled, error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .in('status', cancellableStatuses)
      .select()
      .single()

    if (error || !cancelled) {
      throw Object.assign(new Error('Order cannot be cancelled at this stage'), { status: 422 })
    }

    // Release inventory only after confirming this request won the atomic update
    if (order.items) {
      for (const item of order.items) {
        await InventoryService.release(item.product_id, item.quantity).catch((e) =>
          console.error('[lk-parts] inventory release failed:', e)
        )
      }
    }

    return cancelled as Order
  }
}
