import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

console.log('Starting simple migration test...');

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

// Test with first user
const testUser = users[0];
console.log('Testing with user:', testUser.email);

// Transform user data
const transformedUser = {
  email: testUser.email,
  full_name: testUser.full_name,
  display_name: testUser.display_name || testUser.full_name,
  age_verified: testUser.is_verified === 'true',
  role: 'member',
  account_type: 'free',
  membership_tier: testUser.membership_tier || 'standard',
  daily_likes_remaining: testUser.daily_likes_remaining ? parseInt(testUser.daily_likes_remaining) : 25,
  love_token_balance: testUser.love_token_balance ? parseInt(testUser.love_token_balance) : 0,
  is_online: testUser.is_online === 'true',
  created_date: testUser.created_date || new Date().toISOString(),
  last_active: testUser.last_active || new Date().toISOString()
};

console.log('Transformed user data:', transformedUser);

// Test database connection and check if user exists
console.log('Testing database connection...');
const { data: existingUser, error } = await supabase
  .from('users')
  .select('id')
  .eq('email', transformedUser.email)
  .single();

if (error) {
  console.log('Database error:', error.message);
} else if (existingUser) {
  console.log('User already exists in database');
} else {
  console.log('User does not exist in database - ready for migration');
}

console.log('Simple migration test completed!');