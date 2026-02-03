import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Auth check error:', error);
        return;
    }

    console.log(`Total users in auth.users: ${users.length}`);
    const mockAuth = users.filter(u => u.email.endsWith('@example.com'));
    console.log(`Mock users in auth (@example.com): ${mockAuth.length}`);

    mockAuth.forEach(u => console.log(`- ${u.email}: ${u.id}`));
}

checkAuth();
