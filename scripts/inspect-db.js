const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspect() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('Connecting to database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected!');

    // Check profiles columns
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    console.log('\n--- PROFILES COLUMNS ---');
    console.table(cols.rows);

    // Check departments
    const depts = await client.query(`SELECT id, name FROM departments;`);
    console.log('\n--- DEPARTMENTS ---');
    console.table(depts.rows);

    // Check existing profiles
    const profs = await client.query(`
      SELECT id, user_id, full_name, email, role, phone, student_id, branch, year, department_id
      FROM profiles;
    `);
    console.log('\n--- EXISTING PROFILES ---');
    console.table(profs.rows);

  } catch (err) {
    console.error('Inspection error:', err);
  } finally {
    await client.end();
  }
}

inspect();
