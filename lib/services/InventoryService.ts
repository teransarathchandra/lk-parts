import { supabaseAdmin } from '@/lib/supabase'
import type { Product } from '@/types'

export class InventoryService {
  /**
   * Atomically reserves stock for a product within a transaction.
   * Uses a conditional UPDATE to handle concurrent last-unit races.
   * Returns false (out of stock) if qty not available.
   */
  static async reserve(productId: string, qty: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin.rpc('reserve_inventory', {
      p_product_id: productId,
      p_qty: qty,
    })

    if (error) throw new Error(error.message)
    return data === true
  }

  /**
   * Releases reserved stock on cancellation or payment failure.
   */
  static async release(productId: string, qty: number): Promise<void> {
    const { error } = await supabaseAdmin.rpc('release_inventory', {
      p_product_id: productId,
      p_qty: qty,
    })

    if (error) throw new Error(error.message)
  }

  /**
   * Called when order is confirmed/paid: moves reserved → sold.
   * reserved_quantity -= qty, quantity -= qty
   */
  static async confirmReservation(productId: string, qty: number): Promise<void> {
    const { error } = await supabaseAdmin.rpc('confirm_inventory', {
      p_product_id: productId,
      p_qty: qty,
    })

    if (error) throw new Error(error.message)
  }

  static async getLowStockProducts(threshold?: number): Promise<Product[]> {
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)

    if (threshold !== undefined) {
      query = query.lt('quantity', threshold)
    } else {
      // Use per-product threshold
      query = query.filter('quantity', 'lt', 'low_stock_threshold')
    }

    const { data, error } = await query.order('quantity')
    if (error) throw new Error(error.message)
    return (data ?? []).map((p) => ({ ...p, images: Array.isArray(p.images) ? p.images : [] }))
  }

  static async updateStock(productId: string, quantity: number): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ quantity, inventory_updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async listInventory(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, sku, name, quantity, reserved_quantity, low_stock_threshold, is_active')
      .order('name')

    if (error) throw new Error(error.message)
    return (data ?? []).map((p) => ({ ...p, images: [] })) as unknown as Product[]
  }
}
