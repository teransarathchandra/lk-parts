import { SearchService } from '@/lib/services/SearchService'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') ?? ''
  const vehicleId = searchParams.get('vehicle_id') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  try {
    const products = await SearchService.search(q, vehicleId, limit)
    return Response.json({ products, query: q, count: products.length })
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500
    const message = err instanceof Error ? err.message : 'Search failed'
    return Response.json({ error: message }, { status })
  }
}
