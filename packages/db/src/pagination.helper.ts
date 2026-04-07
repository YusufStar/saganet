export interface OffsetPaginationOptions {
  page?: number;
  limit?: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export function buildOffsetPagination(options: OffsetPaginationOptions): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export function decodeCursor(cursor: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
}

export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}
