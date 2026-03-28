import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const path = searchParams.get('path')

  if (!REVALIDATE_SECRET || secret !== REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (slug) {
      revalidatePath(`/parts/${slug}`)
    }
    if (path) {
      revalidatePath(path)
    }
    return Response.json({ revalidated: true, slug, path })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
