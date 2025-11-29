import { createClient } from '@supabase/supabase-js';

console.log('=== RESTORING ADMIN ROLE FOR SHANE ===');

// Configuration
const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreAdminRole() {
  try {
    console.log('Step 1: Checking current user status...');
    
    // Check if shane@thecyberdyne.com exists in the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'shane@thecyberdyne.com')
      .single();

    if (userError) {
      console.log('Error finding user:', userError.message);
      return;
    }

    if (!userData) {
      console.log('❌ User shane@thecyberdyne.com not found in database');
      console.log('You need to sign up first through the app');
      return;
    }

    console.log('✅ User found:');
    console.log('   ID:', userData.id);
    console.log('   Email:', userData.email);
    console.log('   Current Role:', userData.role);
    console.log('   Created:', userData.created_date);

    // Step 2: Update role to admin
    console.log('\nStep 2: Updating role to admin...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        last_active: new Date().toISOString()
      })
      .eq('email', 'shane@thecyberdyne.com')
      .select();

    if (updateError) {
      console.log('❌ Error updating role:', updateError.message);
      return;
    }

    console.log('✅ Role updated successfully!');
    console.log('   New role:', updateData[0].role);

    // Step 3: Verify the update
    console.log('\nStep 3: Verifying admin role...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('id, email, role, created_date')
      .eq('email', 'shane@thecyberdyne.com')
      .single();

    if (verifyError) {
      console.log('❌ Error verifying update:', verifyError.message);
      return;
    }

    console.log('✅ Verification successful:');
    console.log('   Email:', verifyData.email);
    console.log('   Role:', verifyData.role);
    console.log('   Created:', verifyData.created_date);

    // Step 4: Show all admin users
    console.log('\nStep 4: Listing all admin users...');
    
    const { data: adminUsers, error: adminError } = await supabase
      .from('users')
      .select('id, email, role, created_date')
      .eq('role', 'admin')
      .order('created_date', { ascending: false });

    if (adminError) {
      console.log('❌ Error fetching admin users:', adminError.message);
      return;
    }

    console.log(`✅ Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.created_date}`);
    });

    console.log('\n🎉 ADMIN ROLE RESTORED SUCCESSFULLY!');
    console.log('You can now access the admin dashboard at: http://localhost:8080/admin');
    console.log('Make sure you are signed in with shane@thecyberdyne.com');

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

// Run the function
restoreAdminRole();