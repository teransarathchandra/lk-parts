/**
 * Phone number utilities for Sri Lanka.
 * Storage format: 9-digit bare number, no leading zero, no country code (e.g., "771234567")
 * Display format: "0771234567"
 * WhatsApp format: "94771234567"
 * Validation: /^7[0-9]{8}$/
 */

export function formatForWhatsApp(phone: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // Handle "94771234567" (already with country code)
  if (digits.startsWith('94') && digits.length === 11) {
    return digits
  }
  // Handle "0771234567" (leading zero)
  if (digits.startsWith('0') && digits.length === 10) {
    return `94${digits.slice(1)}`
  }
  // Handle "771234567" (bare 9-digit)
  if (digits.length === 9) {
    return `94${digits}`
  }
  return `94${digits}`
}

export function formatForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 9) {
    return `0${digits}`
  }
  return phone
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('94') && digits.length === 11) {
    return digits.slice(2)
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return digits.slice(1)
  }
  return digits
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone)
  return /^7[0-9]{8}$/.test(normalized)
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const waNumber = formatForWhatsApp(phone)
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
}
