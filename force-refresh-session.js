import { createClient } from '@supabase/supabase-js';

console.log('=== FORCE REFRESHING USER SESSION ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function forceRefreshSession() {
  try {
    console.log('Step 1: Getting current session...');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Error getting session:', sessionError.message);
      return;
    }

    if (!session) {
      console.log('❌ No active session found. Please sign in first.');
      return;
    }

    console.log('✅ Current session found:');
    console.log('   User ID:', session.user.id);
    console.log('   Email:', session.user.email);
    console.log('   Expires:', session.expires_at);

    console.log('\nStep 2: Refreshing session...');
    
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.log('❌ Error refreshing session:', refreshError.message);
    } else {
      console.log('✅ Session refreshed successfully!');
      console.log('   New expires:', refreshData.session?.expires_at);
    }

    console.log('\nStep 3: Getting user profile data...');
    
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, membership_tier, created_date')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.log('❌ Error getting profile:', profileError.message);
    } else {
      console.log('✅ User profile data:');
      console.log('   Email:', profile.email);
      console.log('   Role:', profile.role);
      console.log('   Membership Tier:', profile.membership_tier);
      console.log('   Created:', profile.created_date);
    }

    console.log('\nStep 4: Testing admin route access...');
    
    // Test if we can access admin functions
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(3);
    
    if (adminError) {
      console.log('❌ Admin access test failed:', adminError.message);
    } else {
      console.log('✅ Admin access test passed - Found users:', adminUsers?.length || 0);
    }

    console.log('\n🎉 SESSION REFRESH COMPLETED!');
    console.log('Next steps:');
    console.log('1. Sign out and back in to the application');
    console.log('2. Clear browser cache (Ctrl+Shift+R or Ctrl+F5)');
    console.log('3. Try accessing: http://localhost:8080/admin');
    console.log('4. If still not working, check browser console for errors');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the function
forceRefreshSession();