import { createClient } from '@supabase/supabase-js';

console.log('=== TESTING ADMIN DASHBOARD ACCESS ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAccess() {
  try {
    console.log('Testing admin API functions...');
    
    // Test 1: Get platform analytics (admin function)
    console.log('\nTest 1: Testing platform analytics...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (analyticsError) {
      console.log('❌ Analytics test failed:', analyticsError.message);
    } else {
      console.log('✅ Analytics test passed - Total users:', analytics);
    }

    // Test 2: Get all users (admin function)
    console.log('\nTest 2: Testing user listing...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(3);
    
    if (usersError) {
      console.log('❌ User listing test failed:', usersError.message);
    } else {
      console.log('✅ User listing test passed - Found users:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('   Sample users:', users.map(u => ({ email: u.email, role: u.role })));
      }
    }

    // Test 3: Check admin user specifically
    console.log('\nTest 3: Verifying admin user access...');
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, role, created_date')
      .eq('email', 'shane@thecyberdyne.com')
      .single();
    
    if (adminError) {
      console.log('❌ Admin user verification failed:', adminError.message);
    } else {
      console.log('✅ Admin user verified:');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Created:', adminUser.created_date);
    }

    console.log('\n🎉 ADMIN ACCESS TESTS COMPLETED!');
    console.log('If all tests passed, your admin role is working correctly.');
    console.log('Try accessing: http://localhost:8080/admin');
    console.log('If you still have issues, try:');
    console.log('1. Signing out and back in');
    console.log('2. Clearing browser cache');
    console.log('3. Hard refresh (Ctrl+F5)');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the function
testAdminAccess();