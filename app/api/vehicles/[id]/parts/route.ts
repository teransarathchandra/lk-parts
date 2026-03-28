import { CatalogService } from '@/lib/services/CatalogService'
import { NextRequest } from 'next/server'
import type { SubSection } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = request.nextUrl
  const fitmentType = (searchParams.get('fitment_type') ?? 'all') as 'exact' | 'compatible' | 'all'
  const subSection = searchParams.get('section') as SubSection | null
  const limit = parseInt(searchParams.get('limit') ?? '50', 10)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const [vehicle, products] = await Promise.all([
      CatalogService.getVehicleBySlug(id).catch(() => null),
      CatalogService.getProductsForVehicle(id, {
        fitmentType,
        subSection: subSection ?? undefined,
        limit,
        offset,
      }),
    ])

    return Response.json({ vehicle, products, fitment_type: fitmentType })
  } catch (err) {
    return Response.json({ error: 'Failed to load parts' }, { status: 500 })
  }
}
