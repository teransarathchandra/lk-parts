import { CatalogService } from '@/lib/services/CatalogService'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const vehicleId = request.nextUrl.searchParams.get('vehicle_id') ?? undefined

  try {
    const product = await CatalogService.getProductBySlug(slug, vehicleId)
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    let orderCount = 0
    if (vehicleId) {
      orderCount = await CatalogService.getOrderCountForVehicle(product.id, vehicleId)
    }

    return Response.json({ ...product, order_count: orderCount })
  } catch (err) {
    return Response.json({ error: 'Failed to load product' }, { status: 500 })
  }
}
