import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

console.log('=== AUTH USER MIGRATION STARTING ===');

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
let skipped = 0;

// Process users
for (let i = 0; i < users.length; i++) {
  const user = users[i];
  console.log(`\n[${i + 1}/${users.length}] Processing: ${user.email}`);
  
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email);

    if (checkError) {
      console.log(`❌ Error checking user: ${checkError.message}`);
      failed++;
      continue;
    }

    if (existingUser && existingUser.length > 0) {
      console.log(`⚠️  User already exists: ${user.email}`);
      skipped++;
      continue;
    }

    // Create user profile data
    const userProfile = {
      email: user.email,
      display_name: user.display_name || user.full_name,
      full_name: user.full_name,
      age_verified: user.is_verified === 'true',
      role: 'member',
      account_type: 'free',
      is_suspended: false,
      membership_tier: user.membership_tier || 'standard',
      daily_likes_remaining: user.daily_likes_remaining ? parseInt(user.daily_likes_remaining) : 25,
      verification_count: user.verification_count ? parseInt(user.verification_count) : 0,
      is_online: user.is_online === 'true',
      created_date: user.created_date || new Date().toISOString(),
      last_active: user.last_active || new Date().toISOString(),
      
      // Optional fields with defaults
      balances: {},
      photos: [],
      profile_videos: [],
      bio: user.bio || '',
      demographics: {},
      tags: [],
      discovery_preferences: {},
      referral_code: user.referral_code || '',
      love_balance: user.love_token_balance ? parseInt(user.love_token_balance) : 0,
      love2_balance: user.love2_token_balance ? parseInt(user.love2_token_balance) : 0
    };

    // Insert user using RPC or direct insert
    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert(userProfile)
      .select();

    if (insertError) {
      console.log(`❌ Error inserting user: ${insertError.message}`);
      
      // Try alternative approach - use admin API to create auth user first
      console.log('Trying alternative approach...');
      
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          display_name: user.display_name || user.full_name
        }
      });
      
      if (authError) {
        console.log(`❌ Auth creation failed: ${authError.message}`);
        failed++;
      } else {
        console.log(`✅ Auth user created: ${user.email}`);
        
        // Now try to insert profile with the auth user ID
        const userProfileWithId = {
          ...userProfile,
          id: authData.user.id
        };
        
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert(userProfileWithId)
          .select();
          
        if (profileError) {
          console.log(`❌ Profile creation failed: ${profileError.message}`);
          failed++;
        } else {
          console.log(`✅ Successfully migrated: ${user.email}`);
          successful++;
        }
      }
    } else {
      console.log(`✅ Successfully migrated: ${user.email}`);
      successful++;
    }

  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
    failed++;
  }
}

console.log('\n=== MIGRATION COMPLETED ===');
console.log(`Total users: ${users.length}`);
console.log(`✅ Successful: ${successful}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️  Skipped (already exists): ${skipped}`);