import { describe, it, expect } from 'vitest'
import { capitalize, formatDate, wait } from '../utils'

describe('Utils', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      expect(formatDate(date)).toBe('2024-01-15')
    })
  })

  describe('wait', () => {
    it('should wait for specified time', async () => {
      const start = Date.now()
      await wait(100)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(95)
    })
  })
})
