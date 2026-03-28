import { describe, it, expect } from 'vitest'
import {
  formatForWhatsApp,
  formatForDisplay,
  normalizePhone,
  isValidPhone,
} from '@/lib/utils/phone'

describe('formatForWhatsApp', () => {
  it('converts 9-digit bare number', () => {
    expect(formatForWhatsApp('771234567')).toBe('94771234567')
  })

  it('converts 0-prefixed 10-digit number', () => {
    expect(formatForWhatsApp('0771234567')).toBe('94771234567')
  })

  it('leaves already-formatted 11-digit number unchanged', () => {
    expect(formatForWhatsApp('94771234567')).toBe('94771234567')
  })
})

describe('formatForDisplay', () => {
  it('adds leading 0 to 9-digit number', () => {
    expect(formatForDisplay('771234567')).toBe('0771234567')
  })
})

describe('normalizePhone', () => {
  it('strips leading zero', () => {
    expect(normalizePhone('0771234567')).toBe('771234567')
  })

  it('strips country code', () => {
    expect(normalizePhone('94771234567')).toBe('771234567')
  })

  it('returns bare 9-digit unchanged', () => {
    expect(normalizePhone('771234567')).toBe('771234567')
  })
})

describe('isValidPhone', () => {
  it('accepts valid bare 9-digit number', () => {
    expect(isValidPhone('771234567')).toBe(true)
  })

  it('accepts 0-prefixed number', () => {
    expect(isValidPhone('0771234567')).toBe(true)
  })

  it('accepts 94-prefixed number', () => {
    expect(isValidPhone('94771234567')).toBe(true)
  })

  it('rejects number not starting with 7', () => {
    expect(isValidPhone('011234567')).toBe(false)
  })

  it('rejects too-short number', () => {
    expect(isValidPhone('77123')).toBe(false)
  })
})
