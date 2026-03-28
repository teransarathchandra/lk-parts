'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartIcon } from './CartIcon'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 5)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      aria-label="Main navigation"
      className={`sticky top-0 z-50 border-b border-[var(--border)] bg-white transition-shadow duration-150 ${scrolled ? 'shadow-sm' : ''}`}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3.5">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[20px] font-bold tracking-tight text-[var(--text-primary)]"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[13px] font-bold text-white"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-hidden="true"
          >
            LK
          </span>
          Parts
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-5 text-[#444444]">
          {/* Search */}
          <Link
            href="/search"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center"
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
