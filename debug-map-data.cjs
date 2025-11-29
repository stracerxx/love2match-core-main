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

async function debugMapData() {
  console.log('🔍 Debugging Map Data...\n');

  // Get current user (admin)
  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('id, display_name, demographics')
    .eq('role', 'admin')
    .single();

  if (currentUserError) {
    console.error('Error getting current user:', currentUserError);
  } else {
    console.log('👤 Current User (Admin):');
    console.log('  Name:', currentUser.display_name);
    console.log('  Demographics:', JSON.stringify(currentUser.demographics, null, 2));
    console.log('  Has location_lat:', !!currentUser.demographics?.location_lat);
    console.log('  Has location_lng:', !!currentUser.demographics?.location_lng);
    console.log('');
  }

  // Get discover profiles (excluding current user)
  const { data: profiles, error: profilesError } = await supabase
    .from('users')
    .select('id, display_name, demographics, photos')
    .neq('id', currentUser?.id)
    .eq('is_suspended', false)
    .limit(10);

  if (profilesError) {
    console.error('Error getting profiles:', profilesError);
  } else {
    console.log('👥 Discover Profiles (first 10):');
    profiles.forEach((profile, index) => {
      const demo = profile.demographics || {};
      console.log(`  ${index + 1}. ${profile.display_name}`);
      console.log(`     location_lat: ${demo.location_lat || 'MISSING'}`);
      console.log(`     location_lng: ${demo.location_lng || 'MISSING'}`);
      console.log(`     location: ${demo.location || 'MISSING'}`);
      console.log(`     photos: ${profile.photos?.length || 0} photos`);
      console.log('');
    });

    // Check how many profiles have location data
    const profilesWithLocation = profiles.filter(p => {
      const demo = p.demographics || {};
      return demo.location_lat && demo.location_lng;
    });

    console.log(`📊 Summary: ${profilesWithLocation.length}/${profiles.length} profiles have location data`);
  }

  // Check if there are any JavaScript errors in the browser console
  console.log('\n🔧 Debug Tips:');
  console.log('1. Open browser DevTools (F12) and check Console for errors');
  console.log('2. Check Network tab to see if profile data is being fetched');
  console.log('3. Verify the MapView component is receiving the profiles prop');
  console.log('4. Check if Leaflet CSS is loading properly');
}

debugMapData().catch(console.error);