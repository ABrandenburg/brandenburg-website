
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Vercel-Supabase integration provides POSTGRES_URL (pooler connection)
// Fallback to DATABASE_URL for manual setup
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL!

if (!connectionString) {
    throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required')
}

// Disable prefetch as it is not supported for "Transaction" pool mode
// Vercel Supabase integration uses pooler which requires SSL
const client = postgres(connectionString, {
    prepare: false,
    // Use 'require' for production (Vercel Supabase), allow localhost without SSL
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : 'require'
})
export const db = drizzle(client, { schema })
