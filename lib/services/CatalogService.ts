import { supabaseAdmin } from '@/lib/supabase'
import type { Vehicle, Product, Brand, FitmentType, SubSection } from '@/types'

export class CatalogService {
  /**
   * Returns all active vehicles (flat array for client-side cascade filtering).
   * Cached by edge CDN with long TTL.
   */
  static async listVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('is_active', true)
      .order('type')
      .order('brand')
      .order('model')
      .order('variant')

    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    const { data, error } = await supabaseAdmin
      .from('vehicles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    return data ?? null
  }

  /**
   * Returns all fitting products for a vehicle, annotated with fitment_type.
   * Exact + compatible fitments come first; unknown fitment products (active, no record) follow.
   */
  static async getProductsForVehicle(
    vehicleId: string,
    options: {
      fitmentType?: 'exact' | 'compatible' | 'all'
      subSection?: SubSection
      limit?: number
      offset?: number
    } = {}
  ): Promise<Product[]> {
    const { fitmentType = 'all', subSection, limit = 50, offset = 0 } = options

    // Get fitment records for this vehicle
    let fitmentQuery = supabaseAdmin
      .from('vehicle_fitments')
      .select('product_id, fitment_type, notes')
      .eq('vehicle_id', vehicleId)

    if (fitmentType !== 'all') {
      fitmentQuery = fitmentQuery.eq('fitment_type', fitmentType)
    }

    const { data: fitments, error: fitmentError } = await fitmentQuery
    if (fitmentError) throw new Error(fitmentError.message)

    const fittingProductIds = (fitments ?? []).map((f) => f.product_id)
    const fitmentMap = new Map(
      (fitments ?? []).map((f) => [f.product_id, { fitment_type: f.fitment_type, notes: f.notes }])
    )

    if (fittingProductIds.length === 0 && fitmentType !== 'all') {
      return []
    }

    // Get products
    let productQuery = supabaseAdmin
      .from('products')
      .select('*, brand:brands(*)')
      .eq('is_active', true)
      .range(offset, offset + limit - 1)

    if (subSection) {
      productQuery = productQuery.eq('sub_section', subSection)
    }

    if (fitmentType !== 'all' && fittingProductIds.length > 0) {
      productQuery = productQuery.in('id', fittingProductIds)
    }

    const { data: products, error: productError } = await productQuery
    if (productError) throw new Error(productError.message)

    return (products ?? []).map((p) => {
      const fitmentInfo = fitmentMap.get(p.id)
      return {
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        fitment_type: (fitmentInfo?.fitment_type ?? 'unknown') as FitmentType,
        fitment_notes: fitmentInfo?.notes ?? null,
      }
    })
  }

  static async getProductBySlug(
    slug: string,
    vehicleId?: string
  ): Promise<Product | null> {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*, brand:brands(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(error.message)
    if (!product) return null

    let fitmentType: FitmentType = 'unknown'
    let fitmentNotes: string | null = null

    if (vehicleId) {
      const { data: fitment } = await supabaseAdmin
        .from('vehicle_fitments')
        .select('fitment_type, notes')
        .eq('vehicle_id', vehicleId)
        .eq('product_id', product.id)
        .single()

      if (fitment) {
        fitmentType = fitment.fitment_type as FitmentType
        fitmentNotes = fitment.notes
      }
    }

    return {
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      fitment_type: fitmentType,
      fitment_notes: fitmentNotes,
    }
  }

  static async listBrands(): Promise<Brand[]> {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .order('name')

    if (error) throw new Error(error.message)
    return data ?? []
  }

  /** Count how many times a product was ordered for a specific vehicle (social proof). */
  static async getOrderCountForVehicle(
    productId: string,
    vehicleId: string
  ): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)
      .contains('fitment_snapshot', { vehicle_id: vehicleId })

    if (error) return 0
    return count ?? 0
  }

  static async createProduct(data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return product
  }

  static async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return product
  }
}
