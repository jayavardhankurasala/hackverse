const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  const { data: staffList } = await supabase.from('profiles').select('user_id, full_name, email').eq('role', 'STAFF');
  console.log('\n--- VERIFICATION: SEEDED TICKETS PER STAFF TECHNICIAN ---');
  for (const s of staffList) {
    const { count: assignedCount } = await supabase.from('service_requests').select('id', { count: 'exact', head: true }).eq('assigned_to', s.user_id);
    const { data: tickets } = await supabase.from('service_requests').select('ticket_number, priority, status, title').eq('assigned_to', s.user_id);
    console.log(`\nTechnician: ${s.full_name} (${s.email})`);
    console.log(`Total Directly Assigned Active Tickets: ${assignedCount}`);
    if (tickets) {
      tickets.forEach(t => console.log(`  - [${t.ticket_number}] [${t.priority}] [${t.status}]: ${t.title.substring(0, 50)}`));
    }
  }

  // Also check total tickets in DB
  const { count: totalTickets } = await supabase.from('service_requests').select('id', { count: 'exact', head: true });
  console.log(`\nTotal Tickets in Database: ${totalTickets}\n`);
}
verify();
