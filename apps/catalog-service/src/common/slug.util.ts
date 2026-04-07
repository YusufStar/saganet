const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
};

/**
 * Converts a name to a URL-friendly slug.
 * Turkish characters are transliterated before slugification.
 *
 * @example
 * toSlug('Akıllı Telefon & Aksesuar') // 'akilli-telefon-aksesuar'
 */
export function toSlug(name: string): string {
  return name
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_MAP[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // non-alphanumeric kaldır
    .trim()
    .replace(/[\s-]+/g, '-');       // boşluk/çoklu tire → tek tire
}

/**
 * Appends a short random suffix to guarantee uniqueness when a slug already exists.
 * The suffix is 6 hex characters (16^6 = ~16M combinations).
 *
 * @example
 * toUniqueSlug('akilli-telefon') // 'akilli-telefon-3f9a1b'
 */
export function toUniqueSlug(name: string): string {
  const base = toSlug(name);
  const suffix = Math.random().toString(16).slice(2, 8);
  return `${base}-${suffix}`;
}
