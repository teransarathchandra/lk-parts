import { SearchService } from '@/lib/services/SearchService'
import { ProductCard } from './ProductCard'

interface SearchResultsProps {
  query: string
  vehicleId?: string
}

export async function SearchResults({ query, vehicleId }: SearchResultsProps) {
  let products: Awaited<ReturnType<typeof SearchService.search>> = []
  let error = ''

  try {
    products = await SearchService.search(query, vehicleId, 20)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Search failed'
  }

  if (error) {
    return (
      <div className="rounded-[4px] border border-[var(--accent)] bg-[var(--accent-light)] p-4 text-[14px] text-[var(--accent)]">
        {error}. Please try again.
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-3 text-[15px] text-[var(--text-secondary)]">
          No results for "{query}".
        </p>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Try a different part number or{' '}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? ''}?text=Hi, I'm looking for ${query}`}
            className="text-[var(--accent)] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask via WhatsApp ↗
          </a>
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-[13px] text-[var(--text-secondary)]">
        {products.length} result{products.length !== 1 ? 's' : ''} for "{query}"
      </p>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
