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

console.log('Supabase URL:', supabaseUrl);
console.log('Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.log('Make sure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample locations around San Francisco area
const sampleLocations = [
  { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA' }, // SF Center
  { lat: 37.8044, lng: -122.2711, location: 'Oakland, CA' }, // Oakland
  { lat: 37.3382, lng: -121.8863, location: 'San Jose, CA' }, // San Jose
  { lat: 37.4419, lng: -122.1430, location: 'Palo Alto, CA' }, // Palo Alto
  { lat: 37.6879, lng: -122.4702, location: 'Daly City, CA' }, // Daly City
  { lat: 37.9775, lng: -122.0311, location: 'Concord, CA' }, // Concord
  { lat: 37.5209, lng: -122.2750, location: 'Redwood City, CA' }, // Redwood City
  { lat: 37.6624, lng: -122.4337, location: 'South San Francisco, CA' }, // South SF
  { lat: 37.3688, lng: -122.0363, location: 'Sunnyvale, CA' }, // Sunnyvale
  { lat: 37.5447, lng: -122.0113, location: 'Fremont, CA' } // Fremont
];

async function addSampleLocations() {
  console.log('Fetching existing users...');
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, display_name, demographics')
    .neq('role', 'admin'); // Don't modify admin users

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users to update`);

  let updatedCount = 0;
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const locationIndex = i % sampleLocations.length;
    const location = sampleLocations[locationIndex];
    
    const updatedDemographics = {
      ...(user.demographics || {}),
      location_lat: location.lat,
      location_lng: location.lng,
      location: location.location
    };

    const { error: updateError } = await supabase
      .from('users')
      .update({ demographics: updatedDemographics })
      .eq('id', user.id);

    if (updateError) {
      console.error(`Error updating user ${user.display_name}:`, updateError);
    } else {
      console.log(`Updated ${user.display_name} with location: ${location.location}`);
      updatedCount++;
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} users with sample locations`);
  console.log('The map should now show user location pins!');
}

addSampleLocations().catch(console.error);