
import { createClient } from '@supabase/supabase-js';

console.log('=== CHECKING SPECIFIC USER ===');

// Configuration (using keys found in check-existing-user.js)
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

const targetEmail = 'mclegg_00@yahoo.com';

async function checkUser() {
    console.log(`Searching for user with email: ${targetEmail}`);

    // Check 'users' table (often auth.users or public.users, depending on setup)
    // Since check-existing-user.js queried 'users', we assume that works (likely a view or public table)
    // But usually auth users are in auth.users which isn't directly queryable via client unless service role...
    // Wait, the client is initialized with service_role key (judging by the previous file content having a key that might be one? check-existing-user.js had a key).

    // Let's try to query 'users' first as in the example.
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail);

    if (error) {
        console.log('Error querying users table:', error.message);
    } else if (users && users.length > 0) {
        console.log('User FOUND in users table:', users[0]);
    } else {
        console.log('User NOT found in users table.');
    }

    // Also check 'profiles' table just in case
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', targetEmail); // Assuming profiles has email col, or we might need to join

    if (profileError) {
        // Profile might not have email, often joined by ID. 
        // If we didn't find user in 'users', we can't search by ID.
        console.log('Error querying profiles (or email column missing):', profileError.message);
    } else if (profiles && profiles.length > 0) {
        console.log('User FOUND in profiles table:', profiles[0]);
    } else {
        console.log('User NOT found in profiles table (by email).');
    }
}

checkUser();
