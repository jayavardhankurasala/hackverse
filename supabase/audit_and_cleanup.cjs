const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runAuditAndCleanup() {
  console.log('--- STARTING DATABASE & SEEDING AUDIT ---');
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to PostgreSQL via direct connection.');

    // 1. Check existing constraints
    const constraintsRes = await client.query(`
      SELECT conname, contype, relname 
      FROM pg_constraint c 
      JOIN pg_class r ON c.conrelid = r.oid 
      WHERE r.relname IN ('service_requests', 'profiles', 'departments', 'activity_logs', 'ticket_counters')
    `);
    console.log(`Found ${constraintsRes.rows.length} existing constraints on core tables.`);

    // 2. Audit and Deduplicate Service Requests (identical ticket_number or identical title & user)
    console.log('\n--- AUDITING SERVICE REQUESTS FOR DUPLICATES ---');
    const dupTicketsRes = await client.query(`
      SELECT ticket_number, COUNT(*) as count 
      FROM public.service_requests 
      GROUP BY ticket_number 
      HAVING COUNT(*) > 1;
    `);

    if (dupTicketsRes.rows.length > 0) {
      console.log(`Found ${dupTicketsRes.rows.length} duplicate ticket numbers. Pruning older duplicates...`);
      for (const row of dupTicketsRes.rows) {
        // Keep the latest record, delete older duplicates
        await client.query(`
          DELETE FROM public.service_requests
          WHERE id IN (
            SELECT id FROM public.service_requests
            WHERE ticket_number = $1
            ORDER BY created_at ASC
            LIMIT $2
          )
        `, [row.ticket_number, row.count - 1]);
      }
      console.log('✓ Pruned duplicate service request rows.');
    } else {
      console.log('✓ No duplicate ticket numbers found. All tickets have unique identifiers.');
    }

    // 3. Ensure ticket_number is UNIQUE
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'service_requests_ticket_number_key'
        ) THEN
          ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_ticket_number_key UNIQUE (ticket_number);
        END IF;
      END $$;
    `);
    console.log('✓ Verified UNIQUE constraint on service_requests.ticket_number.');

    // 4. Ensure profiles.email is UNIQUE
    console.log('\n--- AUDITING PROFILES FOR DUPLICATES ---');
    const dupProfilesRes = await client.query(`
      SELECT email, COUNT(*) as count 
      FROM public.profiles 
      GROUP BY email 
      HAVING COUNT(*) > 1;
    `);

    if (dupProfilesRes.rows.length > 0) {
      console.log(`Found ${dupProfilesRes.rows.length} duplicate profile emails. Pruning older duplicate profiles...`);
      for (const row of dupProfilesRes.rows) {
        await client.query(`
          DELETE FROM public.profiles
          WHERE id IN (
            SELECT id FROM public.profiles
            WHERE email = $1
            ORDER BY created_at ASC
            LIMIT $2
          )
        `, [row.email, row.count - 1]);
      }
      console.log('✓ Pruned duplicate profile rows.');
    } else {
      console.log('✓ No duplicate profile emails found.');
    }

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'profiles_email_key'
        ) THEN
          ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
        END IF;
      END $$;
    `);
    console.log('✓ Verified UNIQUE constraint on profiles.email.');

    // 5. Create ticket_counters table and atomic increment function
    console.log('\n--- DEPLOYING ATOMIC TICKET COUNTERS INFRASTRUCTURE ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.ticket_counters (
        counter_date TEXT PRIMARY KEY,
        current_val INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS and public policies for counter read/write
      ALTER TABLE public.ticket_counters ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'ticket_counters' AND policyname = 'Allow service_role and authenticated access to ticket_counters'
        ) THEN
          CREATE POLICY "Allow service_role and authenticated access to ticket_counters"
          ON public.ticket_counters
          FOR ALL
          TO authenticated, service_role
          USING (true)
          WITH CHECK (true);
        END IF;
      END $$;

      -- Atomic ticket number generator function
      CREATE OR REPLACE FUNCTION public.get_next_ticket_number(p_date_prefix TEXT)
      RETURNS TEXT AS $$
      DECLARE
        v_next_val INTEGER;
      BEGIN
        INSERT INTO public.ticket_counters (counter_date, current_val, updated_at)
        VALUES (p_date_prefix, 1, NOW())
        ON CONFLICT (counter_date)
        DO UPDATE SET current_val = ticket_counters.current_val + 1, updated_at = NOW()
        RETURNING current_val INTO v_next_val;

        RETURN p_date_prefix || '-' || v_next_val;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      GRANT EXECUTE ON FUNCTION public.get_next_ticket_number(TEXT) TO authenticated, service_role, anon;
    `);
    console.log('✓ Created public.ticket_counters table and atomic get_next_ticket_number() function.');

    // 6. Seed today's counter value based on existing max ticket number
    const maxTicketRes = await client.query(`
      SELECT ticket_number 
      FROM public.service_requests 
      WHERE ticket_number LIKE '%-%'
    `);

    const dateMaxMap = {};
    for (const row of maxTicketRes.rows) {
      const parts = row.ticket_number.split('-');
      if (parts.length === 2) {
        const prefix = parts[0];
        const seq = parseInt(parts[1], 10);
        if (!isNaN(seq)) {
          dateMaxMap[prefix] = Math.max(dateMaxMap[prefix] || 0, seq);
        }
      }
    }

    for (const [prefix, maxSeq] of Object.entries(dateMaxMap)) {
      await client.query(`
        INSERT INTO public.ticket_counters (counter_date, current_val, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (counter_date)
        DO UPDATE SET current_val = GREATEST(ticket_counters.current_val, $2);
      `, [prefix, maxSeq]);
      console.log(`✓ Initialized atomic ticket counter for date prefix [${prefix}] to sequence ${maxSeq}.`);
    }

    // 7. Verify atomic generator function
    const testGen = await client.query(`SELECT public.get_next_ticket_number('TESTDATE') as next_token`);
    console.log(`✓ Atomic ticket generation test verified: [${testGen.rows[0].next_token}]`);

    // Clean up test token counter
    await client.query(`DELETE FROM public.ticket_counters WHERE counter_date = 'TESTDATE'`);

    // 8. Summary Count of all tables
    const summary = await client.query(`
      SELECT 
        (SELECT count(*) FROM public.service_requests) as service_requests,
        (SELECT count(*) FROM public.profiles) as profiles,
        (SELECT count(*) FROM public.departments) as departments,
        (SELECT count(*) FROM public.ticket_counters) as ticket_counters,
        (SELECT count(*) FROM public.activity_logs) as activity_logs;
    `);

    console.log('\n=========================================');
    console.log('DATABASE AUDIT & CLEANUP COMPLETED:');
    console.log(summary.rows[0]);
    console.log('=========================================\n');

  } catch (err) {
    console.error('Audit and cleanup error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAuditAndCleanup();
