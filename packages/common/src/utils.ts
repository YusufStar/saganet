export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** UTC date normalization */
export function toUTC(date: Date): Date {
  return new Date(date.toISOString());
}

export function formatDate(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Retry with exponential backoff */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 100,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxAttempts) {
        await sleep(baseDelayMs * Math.pow(2, attempt - 1));
      }
    }
  }
  throw lastError;
}

/** Deep clone using structuredClone (available in Node 17+) */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

/** Deep merge two objects */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) &&
        tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)) {
      result[key] = deepMerge(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>) as T[keyof T];
    } else {
      result[key] = srcVal as T[keyof T];
    }
  }
  return result;
}

/** Truncate string to maxLength, adding ellipsis if truncated */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
