import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLocations() {
  console.log('Checking all users for location data...\n');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, display_name, email, demographics')
    .order('display_name');

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users:\n`);

  let withLocation = 0;
  let withoutLocation = 0;

  for (const user of users) {
    const demo = user.demographics || {};
    const hasLat = demo.location_lat !== undefined && demo.location_lat !== null;
    const hasLng = demo.location_lng !== undefined && demo.location_lng !== null;
    const hasCoords = hasLat && hasLng;

    if (hasCoords) {
      withLocation++;
      console.log(`✅ ${user.display_name} (${user.email})`);
      console.log(`   Location: ${demo.location || 'N/A'}`);
      console.log(`   Coords: ${demo.location_lat}, ${demo.location_lng}`);
    } else {
      withoutLocation++;
      console.log(`❌ ${user.display_name} (${user.email})`);
      console.log(`   Location text: ${demo.location || 'N/A'}`);
      console.log(`   Demographics: ${JSON.stringify(demo)}`);
    }
    console.log('');
  }

  console.log('='.repeat(50));
  console.log(`Summary: ${withLocation} with coordinates, ${withoutLocation} without`);
}

checkLocations();
