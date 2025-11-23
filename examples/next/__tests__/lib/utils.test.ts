import { describe, it, expect } from 'vitest';
import { cn, formatDate, debounce } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('handles arrays and objects', () => {
      expect(cn(['foo', 'bar'], { baz: true, qux: false })).toBe('foo bar baz');
    });
  });

  describe('formatDate', () => {
    it('formats date strings correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      expect(formatted).toMatch(/January 15, 2024/);
    });

    it('handles Date objects', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/January 15, 2024/);
    });
  });

  describe('debounce', () => {
    it('delays function execution', async () => {
      let called = false;
      const debouncedFn = debounce(() => {
        called = true;
      }, 100);

      debouncedFn();
      expect(called).toBe(false);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(called).toBe(true);
    });
  });
});
