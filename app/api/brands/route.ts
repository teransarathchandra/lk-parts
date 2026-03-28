import { CatalogService } from '@/lib/services/CatalogService'

export const revalidate = 3600

export async function GET() {
  try {
    const brands = await CatalogService.listBrands()
    return Response.json(brands)
  } catch {
    return Response.json({ error: 'Failed to load brands' }, { status: 500 })
  }
}
