import { supabaseAdmin } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import type { Cart, CartItem } from '@/types'

const CART_TTL_HOURS = 48

export class CartService {
  static async getOrCreate(sessionToken: string): Promise<Cart> {
    // Try to find existing non-expired cart
    const { data: cart } = await supabaseAdmin
      .from('carts')
      .select('*, items:cart_items(*, product:products(*))')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (cart) return cart

    // Create new cart
    const expiresAt = new Date(Date.now() + CART_TTL_HOURS * 60 * 60 * 1000)
    const { data: newCart, error } = await supabaseAdmin
      .from('carts')
      .insert({
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })
      .select('*, items:cart_items(*, product:products(*))')
      .single()

    if (error) throw new Error(error.message)
    return newCart
  }

  static async getByToken(sessionToken: string): Promise<Cart | null> {
    const { data, error } = await supabaseAdmin
      .from('carts')
      .select('*, vehicle:vehicles(*), items:cart_items(*, product:products(*, brand:brands(*)))')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data ?? null
  }

  static async addItem(
    sessionToken: string,
    productId: string,
    quantity = 1
  ): Promise<CartItem> {
    const cart = await this.getOrCreate(sessionToken)

    // Check if item already in cart
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
      .single()

    if (existing) {
      // Increment quantity
      const { data, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    }

    // Add new item
    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .insert({ cart_id: cart.id, product_id: productId, quantity })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // Extend cart TTL on activity
    await supabaseAdmin
      .from('carts')
      .update({
        expires_at: new Date(Date.now() + CART_TTL_HOURS * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', cart.id)

    return data
  }

  static async removeItem(sessionToken: string, productId: string): Promise<void> {
    const cart = await this.getByToken(sessionToken)
    if (!cart) return

    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)
      .eq('product_id', productId)
  }

  static async setVehicle(sessionToken: string, vehicleId: string | null): Promise<void> {
    const cart = await this.getByToken(sessionToken)
    if (!cart) return

    await supabaseAdmin
      .from('carts')
      .update({ vehicle_id: vehicleId })
      .eq('id', cart.id)
  }

  static async assignCustomer(sessionToken: string, customerId: string): Promise<void> {
    await supabaseAdmin
      .from('carts')
      .update({ customer_id: customerId })
      .eq('session_token', sessionToken)
  }

  static generateSessionToken(): string {
    return randomUUID()
  }

  /** Cleanup cron: delete expired carts and release reserved inventory if any */
  static async cleanupExpired(): Promise<void> {
    const { data: expiredCarts } = await supabaseAdmin
      .from('carts')
      .select('id')
      .lt('expires_at', new Date().toISOString())

    if (!expiredCarts || expiredCarts.length === 0) return

    const cartIds = expiredCarts.map((c) => c.id)
    await supabaseAdmin.from('carts').delete().in('id', cartIds)
  }
}
