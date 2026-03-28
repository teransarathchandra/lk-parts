import { InventoryService } from '@/lib/services/InventoryService'
import { NextRequest } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    const inventory = await InventoryService.listInventory()
    return Response.json(inventory)
  } catch {
    return Response.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}
