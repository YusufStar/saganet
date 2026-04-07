import { slugify, sleep, retry, deepClone, deepMerge, truncate } from '../utils';

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });
});

describe('retry', () => {
  it('returns result on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3, 0);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retry(fn, 3, 0);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(retry(fn, 3, 0)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('deepClone', () => {
  it('creates a deep copy', () => {
    const obj = { a: { b: 1 } };
    const clone = deepClone(obj);
    clone.a.b = 2;
    expect(obj.a.b).toBe(1);
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('truncates long strings', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });
});
