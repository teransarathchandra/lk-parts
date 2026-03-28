import { InventoryService } from '@/lib/services/InventoryService'

export async function GET() {
  try {
    const products = await InventoryService.getLowStockProducts()
    return Response.json(products)
  } catch {
    return Response.json({ error: 'Failed to load low-stock products' }, { status: 500 })
  }
}
