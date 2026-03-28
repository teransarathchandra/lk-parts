// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/catalog/ProductCard'
import type { Product } from '@/types'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

beforeEach(() => {
  vi.stubGlobal('fetch', () =>
    Promise.resolve(new Response('{}', { status: 200 }))
  )
})

const BASE_PRODUCT: Product = {
  id: 'p1',
  sku: 'SKU-001',
  name: 'Oil Filter',
  slug: 'oil-filter',
  oem_part_number: 'OEM-123',
  aftermarket_part_number: null,
  brand_id: null,
  description: null,
  technical_notes: null,
  sub_section: 'engine' as unknown as Product['sub_section'],
  price: 1500,
  compare_at_price: null,
  condition: 'new',
  is_active: true,
  images: [],
  quantity: 10,
  reserved_quantity: 0,
  low_stock_threshold: 5,
  inventory_updated_at: '',
  created_at: '',
  updated_at: '',
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={BASE_PRODUCT} />)
    expect(screen.getByText('Oil Filter')).toBeTruthy()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={BASE_PRODUCT} />)
    const links = screen.getAllByRole('link')
    expect(links.some((l) => l.getAttribute('href') === '/parts/oil-filter')).toBe(true)
  })

  it('renders OEM part number when present', () => {
    render(<ProductCard product={BASE_PRODUCT} />)
    expect(screen.getByText('OEM-123')).toBeTruthy()
  })

  it('hides OEM part number when null', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, oem_part_number: null }} />)
    expect(screen.queryByText(/oem/i)).toBeNull()
  })

  it('renders price', () => {
    render(<ProductCard product={BASE_PRODUCT} />)
    expect(screen.getByText('1,500')).toBeTruthy()
  })

  it('shows compare_at_price strikethrough when higher than price', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, compare_at_price: 2000 }} />)
    expect(screen.getByText('2,000')).toBeTruthy()
  })

  it('hides compare_at_price when not higher than price', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, price: 2000, compare_at_price: 1500 }} />)
    expect(screen.queryByText('1,500')).toBeNull()
  })

  it('shows "Free return" ribbon for exact fit in-stock products', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, fitment_type: 'exact' }} />)
    expect(screen.getByText('Free return')).toBeTruthy()
  })

  it('hides "Free return" ribbon for out-of-stock exact fit products', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, fitment_type: 'exact', quantity: 0 }} />)
    expect(screen.queryByText('Free return')).toBeNull()
  })

  it('hides Add to Cart button when out of stock', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, quantity: 0 }} />)
    expect(screen.queryByRole('button', { name: /add.*cart/i })).toBeNull()
  })

  it('shows Add to Cart button when in stock', () => {
    render(<ProductCard product={BASE_PRODUCT} />)
    expect(screen.getByRole('button', { name: /add.*cart/i })).toBeTruthy()
  })

  it('shows sub_section placeholder when no images', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, images: [] }} />)
    expect(screen.getByText('engine')).toBeTruthy()
  })

  it('renders image when images are available', () => {
    render(<ProductCard product={{ ...BASE_PRODUCT, images: ['https://example.com/img.jpg'] }} />)
    expect(screen.getByRole('img')).toBeTruthy()
    expect((screen.getByRole('img') as HTMLImageElement).src).toContain('example.com')
  })
})
