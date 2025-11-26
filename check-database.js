import { createClient } from '@supabase/supabase-js';

console.log('Checking database structure...');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if users table exists and get its structure
console.log('Checking users table...');
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('*')
  .limit(5);

if (usersError) {
  console.log('Error accessing users table:', usersError.message);
} else {
  console.log(`Found ${users.length} existing users in database`);
  if (users.length > 0) {
    console.log('Sample user structure:', Object.keys(users[0]));
  }
}

// Check if we can insert a test user
console.log('\nTesting user insertion...');
const testUser = {
  email: 'test-migration@example.com',
  full_name: 'Test Migration User',
  display_name: 'TestUser',
  age_verified: true,
  role: 'member',
  account_type: 'free',
  membership_tier: 'standard',
  daily_likes_remaining: 25,
  love_token_balance: 0,
  is_online: false,
  created_date: new Date().toISOString(),
  last_active: new Date().toISOString()
};

const { data: insertedUser, error: insertError } = await supabase
  .from('users')
  .insert(testUser)
  .select();

if (insertError) {
  console.log('Error inserting test user:', insertError.message);
} else {
  console.log('Successfully inserted test user:', insertedUser[0].email);
  
  // Clean up test user
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('email', 'test-migration@example.com');
  
  if (deleteError) {
    console.log('Error deleting test user:', deleteError.message);
  } else {
    console.log('Test user cleaned up successfully');
  }
}

console.log('Database check completed!');