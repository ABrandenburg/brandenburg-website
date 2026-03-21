import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.restoreAllMocks()
})

// Keep test output clean
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
