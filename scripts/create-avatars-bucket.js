require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  await client.query(`
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('avatars', 'avatars', true) 
    ON CONFLICT (id) DO UPDATE SET public = true;
  `);

  try {
    await client.query(`
      CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    `);
  } catch (e) {
    // policy might already exist
  }

  try {
    await client.query(`
      CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
    `);
  } catch (e) {}

  try {
    await client.query(`
      CREATE POLICY "Allow user avatar updates" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
    `);
  } catch (e) {}

  console.log('AVATARS_BUCKET_INITIALIZED');
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
