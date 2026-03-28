import Link from 'next/link'
import { CartIcon } from './CartIcon'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[20px] font-bold text-[var(--text-primary)]"
          style={{ letterSpacing: '-0.02em' }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-hidden="true"
          />
          LK Parts
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Link
            href="/search"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--text-secondary)]"
            aria-label="Search parts"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>

          {/* Cart */}
          <CartIcon />
        </div>
      </div>
    </header>
  )
}
