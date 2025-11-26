import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

console.log('=== UPDATING USER PROFILES ===');

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

let successful = 0;
let failed = 0;

// Process users
for (let i = 0; i < users.length; i++) {
  const user = users[i];
  console.log(`\n[${i + 1}/${users.length}] Updating: ${user.email}`);
  
  try {
    // Get the user ID from the database
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (fetchError || !dbUser) {
      console.log(`❌ User not found in database: ${user.email}`);
      failed++;
      continue;
    }

    // Prepare update data
    const updateData = {
      display_name: user.display_name || user.full_name,
      full_name: user.full_name,
      age_verified: user.is_verified === 'true',
      membership_tier: user.membership_tier || 'standard',
      daily_likes_remaining: user.daily_likes_remaining ? parseInt(user.daily_likes_remaining) : 25,
      verification_count: user.verification_count ? parseInt(user.verification_count) : 0,
      is_online: user.is_online === 'true',
      created_date: user.created_date || new Date().toISOString(),
      last_active: user.last_active || new Date().toISOString(),
      bio: user.bio || '',
      referral_code: user.referral_code || '',
      love_balance: user.love_token_balance ? parseInt(user.love_token_balance) : 0,
      love2_balance: user.love2_token_balance ? parseInt(user.love2_token_balance) : 0
    };

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', dbUser.id)
      .select();

    if (updateError) {
      console.log(`❌ Error updating user: ${updateError.message}`);
      failed++;
    } else {
      console.log(`✅ Successfully updated: ${user.email}`);
      successful++;
    }

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    failed++;
  }
}

console.log('\n=== PROFILE UPDATE COMPLETED ===');
console.log(`Total users: ${users.length}`);
console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);