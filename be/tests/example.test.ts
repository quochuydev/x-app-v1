import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with async/await', async () => {
    const result = await Promise.resolve('Hello, Vitest!')
    expect(result).toBe('Hello, Vitest!')
  })

  it('should handle objects', () => {
    const user = { name: 'John', age: 30 }
    expect(user).toHaveProperty('name')
    expect(user.name).toBe('John')
  })
})
