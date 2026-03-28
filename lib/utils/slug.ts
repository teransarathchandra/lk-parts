export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizePartNumber(partNumber: string): string {
  return partNumber.toLowerCase().replace(/[^a-z0-9]/g, '')
}
