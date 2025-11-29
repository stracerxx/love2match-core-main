const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      // Remove quotes from the value
      let cleanValue = value.trim();
      if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
        cleanValue = cleanValue.slice(1, -1);
      }
      acc[key.trim()] = cleanValue;
    }
    return acc;
  }, {});
  
  Object.assign(process.env, envVars);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdminLocation() {
  console.log('Finding admin user...');
  
  // Find the admin user (assuming it's the user with role 'admin')
  const { data: adminUsers, error } = await supabase
    .from('users')
    .select('id, display_name, demographics')
    .eq('role', 'admin');

  if (error) {
    console.error('Error finding admin user:', error);
    return;
  }

  if (!adminUsers || adminUsers.length === 0) {
    console.log('No admin user found');
    return;
  }

  const adminUser = adminUsers[0];
  console.log(`Found admin user: ${adminUser.display_name}`);

  // Add San Francisco location for admin
  const updatedDemographics = {
    ...(adminUser.demographics || {}),
    location_lat: 37.7749,
    location_lng: -122.4194,
    location: 'San Francisco, CA'
  };

  const { error: updateError } = await supabase
    .from('users')
    .update({ demographics: updatedDemographics })
    .eq('id', adminUser.id);

  if (updateError) {
    console.error('Error updating admin location:', updateError);
  } else {
    console.log('✅ Successfully updated admin user with San Francisco location');
    console.log('The map should now show your location as well!');
  }
}

addAdminLocation().catch(console.error);