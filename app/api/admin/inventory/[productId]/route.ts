import { InventoryService } from '@/lib/services/InventoryService'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const UpdateSchema = z.object({ quantity: z.number().int().min(0) })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params
  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    const product = await InventoryService.updateStock(productId, parsed.data.quantity)
    return Response.json(product)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update stock'
    return Response.json({ error: message }, { status: 500 })
  }
}
