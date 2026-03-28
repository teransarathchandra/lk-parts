import { CatalogService } from '@/lib/services/CatalogService'
import { NextRequest } from 'next/server'

export const revalidate = 86400 // 24h edge cache

export async function GET(_req: NextRequest) {
  try {
    const vehicles = await CatalogService.listVehicles()
    return Response.json(vehicles)
  } catch (err) {
    return Response.json({ error: 'Failed to load vehicles' }, { status: 500 })
  }
}
