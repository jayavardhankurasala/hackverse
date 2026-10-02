const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verify() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    console.log('=== VERIFYING PROFILES DATA INTEGRITY ===');
    const res = await client.query(`
      SELECT 
        full_name,
        email,
        role,
        student_id,
        roll_number,
        branch,
        year,
        phone,
        department_id
      FROM public.profiles
      ORDER BY role, full_name;
    `);

    console.table(res.rows);

    const nullCount = await client.query(`
      SELECT COUNT(*) as null_count
      FROM public.profiles
      WHERE branch IS NULL OR year IS NULL OR phone IS NULL OR roll_number IS NULL OR student_id IS NULL;
    `);

    console.log(`\nRemaining NULL required fields in profiles: ${nullCount.rows[0].null_count}`);

    if (parseInt(nullCount.rows[0].null_count, 10) === 0) {
      console.log('🎉 ALL PROFILES STRICTLY POPULATED - ZERO NULLS!');
    } else {
      console.error('⚠️ Found profiles with NULL values!');
    }

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    await client.end();
  }
}

verify();
