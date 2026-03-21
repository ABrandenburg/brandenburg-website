import { vi } from 'vitest'

/**
 * Creates a chainable Supabase query builder mock.
 * Each method returns `this` to allow chaining, and the terminal
 * method (single/maybeSingle) resolves the configured result.
 */
export function createMockSupabaseClient(overrides?: {
  selectResult?: { data: unknown; error?: unknown }
  insertResult?: { data: unknown; error?: unknown }
  updateResult?: { data: unknown; error?: unknown }
  upsertResult?: { data: unknown; error?: unknown }
  deleteResult?: { data: unknown; error?: unknown }
}) {
  const defaults = {
    selectResult: { data: null },
    insertResult: { data: null },
    updateResult: { data: null },
    upsertResult: { data: null },
    deleteResult: { data: null },
  }
  const config = { ...defaults, ...overrides }

  // Build a query builder that always returns itself for chaining
  const createQueryBuilder = (result: { data: unknown; error?: unknown }) => {
    const builder: Record<string, unknown> = {}
    const chainMethods = [
      'select', 'insert', 'update', 'upsert', 'delete',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
      'is', 'in', 'order', 'limit', 'range', 'filter', 'match',
      'or', 'and', 'not', 'contains', 'containedBy', 'overlaps',
    ]
    for (const method of chainMethods) {
      builder[method] = vi.fn().mockReturnValue(builder)
    }
    // Terminal methods
    builder.single = vi.fn().mockResolvedValue(result)
    builder.maybeSingle = vi.fn().mockResolvedValue(result)
    builder.then = vi.fn((resolve: (val: unknown) => void) => resolve(result))
    return builder
  }

  const selectBuilder = createQueryBuilder(config.selectResult)
  const insertBuilder = createQueryBuilder(config.insertResult)
  const updateBuilder = createQueryBuilder(config.updateResult)
  const deleteBuilder = createQueryBuilder(config.deleteResult)

  const from = vi.fn().mockImplementation(() => {
    return {
      select: vi.fn().mockReturnValue(selectBuilder),
      insert: vi.fn().mockReturnValue(insertBuilder),
      update: vi.fn().mockReturnValue(updateBuilder),
      upsert: vi.fn().mockReturnValue(updateBuilder),
      delete: vi.fn().mockReturnValue(deleteBuilder),
    }
  })

  return { from }
}

/**
 * Set up the Supabase module mock. Call this at the top of test files that use Supabase.
 * Returns a function to configure the mock client per test.
 */
export function mockSupabaseModule() {
  let mockClient = createMockSupabaseClient()

  vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => mockClient),
  }))

  return {
    setClient(client: ReturnType<typeof createMockSupabaseClient>) {
      mockClient = client
    },
    getClient() {
      return mockClient
    },
  }
}
