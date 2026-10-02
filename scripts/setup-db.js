const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const argUrl = process.argv[2];
  const databaseUrl = argUrl || process.env.DATABASE_URL;

  console.log('========================================================');
  console.log('   CAMPUS SERVICE DESK - SUPABASE DATABASE SETUP');
  console.log('========================================================\n');

  if (!databaseUrl) {
    console.log('ℹ️  No DATABASE_URL found in .env.local or command arguments.');
    console.log('\nYou can connect using either of two easy ways:\n');
    console.log('WAY 1 (Automated Script - like in MediKiosk):');
    console.log('  Run: node scripts/setup-db.js "postgresql://postgres:[PASSWORD]@db.serpaawobdsheyjpnvhs.supabase.co:5432/postgres"');
    console.log('  (Replace [PASSWORD] with your Supabase database password)\n');
    console.log('WAY 2 (Supabase Web SQL Editor - No password needed):');
    console.log('  1. Open: https://supabase.com/dashboard/project/serpaawobdsheyjpnvhs/sql/new');
    console.log('  2. Copy all code from: supabase/complete_setup.sql');
    console.log('  3. Paste into the editor and click "Run"\n');
    return;
  }

  console.log('🔌 Connecting to PostgreSQL database via connection string...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'complete_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Running database schema setup (tables, triggers, policies, departments)...');
    await client.query(sql);

    console.log('✅ Schema executed successfully!\n');

    // Verification
    const deptRes = await client.query('SELECT name FROM departments ORDER BY name;');
    console.log('📋 Verified departments in database:');
    deptRes.rows.forEach((r) => console.log('   • ' + r.name));

    console.log('\n🎉 ALL DONE! Supabase is fully configured and ready.');
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('\n👉 The database password in your DATABASE_URL was incorrect.');
      console.error('   You can reset your database password in Supabase Dashboard -> Project Settings -> Database.');
    }
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

main();
