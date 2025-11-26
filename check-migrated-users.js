import { createClient } from '@supabase/supabase-js';

console.log('=== CHECKING MIGRATED USERS ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all users to see what was created
console.log('Getting all users...');
const { data: allUsers, error } = await supabase
  .from('users')
  .select('*')
  .order('created_date', { ascending: false });

if (error) {
  console.log('Error:', error.message);
} else {
  console.log(`Found ${allUsers.length} users in database:`);
  allUsers.forEach(user => {
    console.log(`- ${user.email} (${user.id}) - Created: ${user.created_date}`);
  });
}

console.log('=== CHECK COMPLETED ===');