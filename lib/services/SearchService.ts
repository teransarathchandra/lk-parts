import { supabaseAdmin } from '@/lib/supabase'
import type { Product, FitmentType } from '@/types'
import { normalizePartNumber } from '@/lib/utils/slug'

const MAX_QUERY_LENGTH = 200

export class SearchService {
  /**
   * Phase 1: Postgres FTS + pg_trgm GIN for hyphenated OEM part numbers.
   * Part numbers use ILIKE (pg_trgm), names use tsvector.
   * Search on both raw and normalized part numbers (migration 002).
   */
  static async search(
    query: string,
    vehicleId?: string,
    limit = 20
  ): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      throw Object.assign(new Error('Query is required'), { status: 400 })
    }
    if (query.length > MAX_QUERY_LENGTH) {
      throw Object.assign(new Error('Query too long'), { status: 400 })
    }

    const q = query.trim()
    const normalizedQ = normalizePartNumber(q)

    // Build the search using Supabase RPC for complex OR across columns
    // We run two strategies and UNION-style merge:
    // 1. Part number ILIKE match (raw) + normalized match
    // 2. Full-text match on name
    const { data: products, error } = await supabaseAdmin.rpc('search_products', {
      query_text: q,
      normalized_query: normalizedQ,
      vehicle_id_param: vehicleId ?? null,
      result_limit: limit,
    })

    if (error) {
      // Fallback: direct query if RPC not available
      return await this.searchFallback(q, normalizedQ, vehicleId, limit)
    }

    return (products ?? []).map((p: Product) => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      fitment_type: (p.fitment_type ?? 'unknown') as FitmentType,
    }))
  }

  /**
   * Fallback search without custom RPC — used before the DB function is created.
   */
  private static async searchFallback(
    q: string,
    normalizedQ: string,
    vehicleId: string | undefined,
    limit: number
  ): Promise<Product[]> {
    // Part number match (raw ILIKE — pg_trgm)
    const { data: partNumResults } = await supabaseAdmin
      .from('products')
      .select('*, brand:brands(*)')
      .eq('is_active', true)
      .or(
        `oem_part_number.ilike.%${q}%,aftermarket_part_number.ilike.%${q}%,normalized_oem_part_number.eq.${normalizedQ},normalized_aftermarket_part_number.eq.${normalizedQ}`
      )
      .limit(limit)

    // Name FTS match
    const { data: nameResults } = await supabaseAdmin
      .from('products')
      .select('*, brand:brands(*)')
      .eq('is_active', true)
      .textSearch('name', q.replace(/\s+/g, ' & '), {
        type: 'plain',
        config: 'english',
      })
      .limit(limit)

    // Merge and deduplicate
    const seen = new Set<string>()
    const merged: Product[] = []
    for (const p of [...(partNumResults ?? []), ...(nameResults ?? [])]) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        merged.push({ ...p, images: Array.isArray(p.images) ? p.images : [] })
      }
    }

    if (!vehicleId || merged.length === 0) {
      return merged.map((p) => ({ ...p, fitment_type: 'unknown' as FitmentType }))
    }

    // Annotate with fitment data
    const productIds = merged.map((p) => p.id)
    const { data: fitments } = await supabaseAdmin
      .from('vehicle_fitments')
      .select('product_id, fitment_type')
      .eq('vehicle_id', vehicleId)
      .in('product_id', productIds)

    const fitmentMap = new Map(
      (fitments ?? []).map((f) => [f.product_id, f.fitment_type as FitmentType])
    )

    return merged.map((p) => ({
      ...p,
      fitment_type: fitmentMap.get(p.id) ?? ('unknown' as FitmentType),
    }))
  }
}
