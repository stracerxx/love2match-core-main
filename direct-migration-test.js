import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

console.log('=== DIRECT MIGRATION TEST ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Load and parse CSV
console.log('Loading CSV data...');
const data = fs.readFileSync('user-data.csv', 'utf8');
const users = parse(data, { columns: true, skip_empty_lines: true, trim: true });

console.log(`Loaded ${users.length} users from CSV`);

// Test with first 3 users
const testUsers = users.slice(0, 3);

for (const user of testUsers) {
  console.log(`\n--- Testing migration for: ${user.email} ---`);
  
  // Transform user data
  const transformedUser = {
    email: user.email,
    full_name: user.full_name,
    display_name: user.display_name || user.full_name,
    age_verified: user.is_verified === 'true',
    role: 'member',
    account_type: 'free',
    membership_tier: user.membership_tier || 'standard',
    daily_likes_remaining: user.daily_likes_remaining ? parseInt(user.daily_likes_remaining) : 25,
    love_balance: user.love_token_balance ? parseInt(user.love_token_balance) : 0,
    is_online: user.is_online === 'true',
    created_date: user.created_date || new Date().toISOString(),
    last_active: user.last_active || new Date().toISOString()
  };

  console.log('Transformed user:', transformedUser);

  // Check if user exists
  console.log('Checking if user exists in database...');
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', transformedUser.email);

  if (checkError) {
    console.log('Error checking user:', checkError.message);
  } else if (existingUser && existingUser.length > 0) {
    console.log('User already exists in database');
  } else {
    console.log('User does not exist - ready for migration');
    
    // Test insertion (dry run)
    console.log('DRY RUN: Would insert user:', transformedUser.email);
  }
}

console.log('\n=== DIRECT MIGRATION TEST COMPLETED ===');