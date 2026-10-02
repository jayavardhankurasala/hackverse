const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database successfully!\n');

    console.log('🚀 Step 1: Adding roll_number column to public.profiles if not exists...');
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number TEXT;
    `);
    console.log('✅ Column roll_number ready.');

    console.log('\n🚀 Step 2: Populating NULL fields for all pre-existing profiles...');

    // 2a. Update Student profiles
    const studentUpdate = await client.query(`
      UPDATE public.profiles
      SET 
        branch = COALESCE(NULLIF(branch, ''), 'CSE'),
        year = COALESCE(NULLIF(year, ''), '3rd Year'),
        phone = COALESCE(NULLIF(phone, ''), '+91 98765 43210'),
        roll_number = COALESCE(NULLIF(roll_number, ''), NULLIF(student_id, ''), 'CS2026-001'),
        student_id = COALESCE(NULLIF(student_id, ''), NULLIF(roll_number, ''), 'CS2026-001'),
        updated_at = NOW()
      WHERE role = 'STUDENT'
        AND (
          branch IS NULL OR branch = '' OR
          year IS NULL OR year = '' OR
          phone IS NULL OR phone = '' OR
          roll_number IS NULL OR roll_number = '' OR
          student_id IS NULL OR student_id = ''
        );
    `);
    console.log(`✅ Updated ${studentUpdate.rowCount} STUDENT profile(s).`);

    // 2b. Update Staff profiles
    const staffUpdate = await client.query(`
      UPDATE public.profiles
      SET 
        branch = COALESCE(NULLIF(branch, ''), 'Engineering Maintenance'),
        year = COALESCE(NULLIF(year, ''), 'Staff / Technician'),
        phone = COALESCE(NULLIF(phone, ''), '+91 98765 43220'),
        roll_number = COALESCE(NULLIF(roll_number, ''), NULLIF(student_id, ''), 'EMP-STF-01'),
        student_id = COALESCE(NULLIF(student_id, ''), NULLIF(roll_number, ''), 'EMP-STF-01'),
        department_id = COALESCE(
          department_id,
          (SELECT id FROM departments WHERE name = 'Plumbing' LIMIT 1),
          (SELECT id FROM departments LIMIT 1)
        ),
        updated_at = NOW()
      WHERE role = 'STAFF'
        AND (
          branch IS NULL OR branch = '' OR
          year IS NULL OR year = '' OR
          phone IS NULL OR phone = '' OR
          roll_number IS NULL OR roll_number = '' OR
          student_id IS NULL OR student_id = '' OR
          department_id IS NULL
        );
    `);
    console.log(`✅ Updated ${staffUpdate.rowCount} STAFF profile(s).`);

    // 2c. Update Admin profiles
    const adminUpdate = await client.query(`
      UPDATE public.profiles
      SET 
        branch = COALESCE(NULLIF(branch, ''), 'Central Administration'),
        year = COALESCE(NULLIF(year, ''), 'Master Administrator'),
        phone = COALESCE(NULLIF(phone, ''), '+91 98765 43200'),
        roll_number = COALESCE(NULLIF(roll_number, ''), NULLIF(student_id, ''), 'ADM-SVEC-01'),
        student_id = COALESCE(NULLIF(student_id, ''), NULLIF(roll_number, ''), 'ADM-SVEC-01'),
        department_id = COALESCE(
          department_id,
          (SELECT id FROM departments WHERE name = 'Administration' LIMIT 1),
          (SELECT id FROM departments LIMIT 1)
        ),
        updated_at = NOW()
      WHERE role = 'ADMIN'
        AND (
          branch IS NULL OR branch = '' OR
          year IS NULL OR year = '' OR
          phone IS NULL OR phone = '' OR
          roll_number IS NULL OR roll_number = '' OR
          student_id IS NULL OR student_id = ''
        );
    `);
    console.log(`✅ Updated ${adminUpdate.rowCount} ADMIN profile(s).`);

    console.log('\n🚀 Step 3: Creating auto-sync trigger for roll_number <-> student_id...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.sync_profiles_defaults_and_roll()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Sync roll_number and student_id
        IF NEW.roll_number IS NOT NULL AND (NEW.student_id IS NULL OR NEW.student_id = '') THEN
          NEW.student_id := NEW.roll_number;
        ELSIF NEW.student_id IS NOT NULL AND (NEW.roll_number IS NULL OR NEW.roll_number = '') THEN
          NEW.roll_number := NEW.student_id;
        END IF;

        -- Role-specific clean defaults if omitted
        IF NEW.role = 'STUDENT' THEN
          IF NEW.branch IS NULL OR NEW.branch = '' THEN NEW.branch := 'CSE'; END IF;
          IF NEW.year IS NULL OR NEW.year = '' THEN NEW.year := '3rd Year'; END IF;
          IF NEW.phone IS NULL OR NEW.phone = '' THEN NEW.phone := '+91 98765 43210'; END IF;
        ELSIF NEW.role = 'STAFF' THEN
          IF NEW.branch IS NULL OR NEW.branch = '' THEN NEW.branch := 'Engineering Maintenance'; END IF;
          IF NEW.year IS NULL OR NEW.year = '' THEN NEW.year := 'Staff / Technician'; END IF;
          IF NEW.phone IS NULL OR NEW.phone = '' THEN NEW.phone := '+91 98765 43220'; END IF;
        ELSIF NEW.role = 'ADMIN' THEN
          IF NEW.branch IS NULL OR NEW.branch = '' THEN NEW.branch := 'Central Administration'; END IF;
          IF NEW.year IS NULL OR NEW.year = '' THEN NEW.year := 'Master Administrator'; END IF;
          IF NEW.phone IS NULL OR NEW.phone = '' THEN NEW.phone := '+91 98765 43200'; END IF;
        END IF;

        NEW.updated_at := NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_sync_profiles_defaults ON public.profiles;
      CREATE TRIGGER trg_sync_profiles_defaults
      BEFORE INSERT OR UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.sync_profiles_defaults_and_roll();
    `);
    console.log('✅ Trigger trg_sync_profiles_defaults successfully created.');

    console.log('\n🚀 Step 4: Verification - Inspecting public.profiles table after migration:');
    const result = await client.query(`
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
    console.table(result.rows);

    const nullCheck = await client.query(`
      SELECT COUNT(*) as null_count
      FROM public.profiles
      WHERE branch IS NULL OR year IS NULL OR phone IS NULL OR roll_number IS NULL OR student_id IS NULL;
    `);
    console.log(`\nRemaining rows with ANY NULL in required profile fields: ${nullCheck.rows[0].null_count}`);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nMigration complete.');
  }
}

runMigration();
