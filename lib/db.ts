
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Support both Vercel-Supabase integration (POSTGRES_URL) and manual (DATABASE_URL)
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, {
    prepare: false,
    ssl: 'require'
})
export const db = drizzle(client, { schema })
