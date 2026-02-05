// Run Supabase migrations
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  // Read DATABASE_URL from environment
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = postgres(DATABASE_URL, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Read the combined migrations file
    const migrationsPath = path.join(__dirname, '../supabase/COMBINED_MIGRATIONS.sql');
    const migrationSQL = fs.readFileSync(migrationsPath, 'utf-8');

    console.log('📄 Running migrations...');

    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - raw_ad_spend');
    console.log('  - raw_servicetitan_jobs');
    console.log('  - technicians');
    console.log('  - review_requests');
    console.log('  - reviews_received');
    console.log('  - tech_performance_card (materialized view)');
    console.log('');
    console.log('Created function:');
    console.log('  - refresh_tech_performance_card()');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
