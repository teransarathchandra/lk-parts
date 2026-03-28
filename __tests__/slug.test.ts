import { describe, it, expect } from 'vitest'
import { normalizePartNumber } from '@/lib/utils/slug'

describe('normalizePartNumber', () => {
  it('strips hyphens from OEM part number', () => {
    expect(normalizePartNumber('15400-PLM-A02')).toBe('15400plma02')
  })

  it('lowercases the result', () => {
    expect(normalizePartNumber('15400PLM-A02')).toBe('15400plma02')
  })

  it('strips all non-alphanumeric characters', () => {
    expect(normalizePartNumber('AB-1234/CD')).toBe('ab1234cd')
  })

  it('normalised values match despite different formatting', () => {
    const raw = normalizePartNumber('15400-PLM-A02')
    const noHyphens = normalizePartNumber('15400PLM-A02')
    const noDash = normalizePartNumber('15400PLMA02')
    expect(raw).toBe(noHyphens)
    expect(raw).toBe(noDash)
  })
})
