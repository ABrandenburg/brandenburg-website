// Diagnostic script to test database connection
const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('Connection string (masked):', connectionString?.replace(/:[^@]+@/, ':***@'));

async function test() {
    try {
        const sql = postgres(connectionString, { prepare: false });

        // Test 1: Basic connection
        console.log('\n1. Testing basic connection...');
        const result = await sql`SELECT NOW() as time`;
        console.log('   ✅ Connected! Server time:', result[0].time);

        // Test 2: List all tables
        console.log('\n2. Listing tables in public schema...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log('   Tables found:', tables.map(t => t.table_name));

        // Test 3: Check if submissions exists
        console.log('\n3. Checking for submissions table...');
        const submissionsExists = tables.some(t => t.table_name === 'submissions');
        if (submissionsExists) {
            console.log('   ✅ submissions table EXISTS');
            const count = await sql`SELECT count(*) FROM submissions`;
            console.log('   Row count:', count[0].count);
        } else {
            console.log('   ❌ submissions table DOES NOT EXIST');
        }

        await sql.end();
        console.log('\n✅ All tests complete!');
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

test();
