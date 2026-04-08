import { buildOffsetPagination, encodeCursor, decodeCursor } from '../pagination.helper';

describe('buildOffsetPagination()', () => {
  it('returns defaults when no options provided', () => {
    const result = buildOffsetPagination({});
    expect(result).toEqual({ skip: 0, take: 20, page: 1, limit: 20 });
  });

  it('calculates skip correctly for page 2', () => {
    const result = buildOffsetPagination({ page: 2, limit: 10 });
    expect(result.skip).toBe(10);
    expect(result.take).toBe(10);
  });

  it('clamps page to minimum 1', () => {
    const result = buildOffsetPagination({ page: -5 });
    expect(result.page).toBe(1);
    expect(result.skip).toBe(0);
  });

  it('clamps limit to minimum 1', () => {
    const result = buildOffsetPagination({ limit: 0 });
    expect(result.limit).toBe(1);
  });

  it('clamps limit to maximum 100', () => {
    const result = buildOffsetPagination({ limit: 999 });
    expect(result.limit).toBe(100);
    expect(result.take).toBe(100);
  });
});

describe('cursor encoding / decoding', () => {
  it('encodes and decodes cursor round-trip', () => {
    const data = { id: 'abc123', createdAt: '2024-01-01T00:00:00Z' };
    const cursor = encodeCursor(data);
    const decoded = decodeCursor(cursor);
    expect(decoded).toEqual(data);
  });

  it('produces a valid base64url string', () => {
    const cursor = encodeCursor({ id: 'test' });
    expect(cursor).not.toMatch(/[+/=]/);
  });

  it('throws on invalid cursor', () => {
    expect(() => decodeCursor('not-valid-base64url!!!')).toThrow();
  });
});
