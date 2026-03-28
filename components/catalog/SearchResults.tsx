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
      <div className="rounded-[8px] border border-red-200 bg-red-50 p-5 text-[14px] text-red-700">
        <div className="flex items-center gap-2 font-medium mb-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          Search error
        </div>
        <p>{error}. Please try again.</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg className="mx-auto mb-4 text-[var(--border)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <p className="mb-2 text-[18px] font-semibold text-[var(--text-primary)]">
          No parts found for &ldquo;{query}&rdquo;
        </p>
        <p className="mb-1 text-[13px] text-[var(--text-secondary)]">
          Try a broader search term or check the part number.
        </p>
        <p className="text-[13px] text-[var(--text-secondary)]">
          {process.env.NEXT_PUBLIC_SUPPORT_PHONE && (
            <>
              Can&apos;t find it?{' '}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_PHONE}?text=${encodeURIComponent(`Hi, I'm looking for ${query}`)}`}
                className="text-[var(--accent)] hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask via WhatsApp ↗
              </a>
            </>
          )}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-4 text-[13px] font-medium text-[var(--text-secondary)]">
        <span className="text-[var(--text-primary)] font-semibold">{products.length}</span>{' '}
        result{products.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>
      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
