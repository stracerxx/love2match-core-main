import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: allUsers, error: error1 } = await supabase
        .from('users')
        .select('email, display_name, demographics');

    if (error1) {
        console.error('Error fetching users:', error1);
        return;
    }

    console.log(`Total users in DB: ${allUsers.length}`);

    const mockUsers = allUsers.filter(u => u.email.endsWith('@example.com'));
    console.log(`Mock users (@example.com): ${mockUsers.length}`);

    mockUsers.forEach(u => {
        console.log(`- ${u.email}: ${JSON.stringify(u.demographics)}`);
    });

    const usersWithLoc = allUsers.filter(u => u.demographics?.location_lat);
    console.log(`Users with location_lat: ${usersWithLoc.length}`);
}

check();
