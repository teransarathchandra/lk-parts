import { CatalogService } from '@/lib/services/CatalogService'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { slugify } from '@/lib/utils/slug'

const CreateProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  sub_section: z.enum([
    'engine', 'brakes', 'suspension', 'electrical', 'body',
    'interior', 'filters', 'lighting', 'wheels_tyres', 'transmission', 'cooling',
  ]),
  price: z.number().positive(),
  compare_at_price: z.number().optional(),
  oem_part_number: z.string().optional(),
  aftermarket_part_number: z.string().optional(),
  description: z.string().optional(),
  condition: z.enum(['new', 'used', 'refurbished']).default('new'),
  quantity: z.number().int().min(0).default(0),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = CreateProductSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    const slug = slugify(parsed.data.name + '-' + parsed.data.sku)
    const product = await CatalogService.createProduct({
      ...parsed.data,
      slug,
      is_active: true,
      images: [],
    })
    return Response.json(product, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create product'
    return Response.json({ error: message }, { status: 500 })
  }
}
