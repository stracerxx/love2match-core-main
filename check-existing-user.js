import { createClient } from '@supabase/supabase-js';

console.log('=== CHECKING EXISTING USER STRUCTURE ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Get the existing user to see the ID format
console.log('Getting existing user...');
const { data: existingUsers, error } = await supabase
  .from('users')
  .select('*')
  .limit(1);

if (error) {
  console.log('Error:', error.message);
} else if (existingUsers && existingUsers.length > 0) {
  const user = existingUsers[0];
  console.log('Existing user found:');
  console.log('ID:', user.id, 'Type:', typeof user.id);
  console.log('Email:', user.email);
  console.log('Full user object:', JSON.stringify(user, null, 2));
} else {
  console.log('No existing users found');
}

console.log('=== CHECK COMPLETED ===');