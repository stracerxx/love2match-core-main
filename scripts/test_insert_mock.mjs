import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // I might not have uuid installed, I'll use a hardcoded valid one

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const testUser = {
        id: '00000000-0000-4000-8000-000000000001', // Valid UUID
        email: 'test.mock@example.com',
        display_name: 'Test Mock',
        role: 'member',
        is_suspended: false,
        demographics: {
            location: 'Test City',
            location_lat: 40.7128,
            location_lng: -74.0060
        }
    };

    const { data, error } = await supabase
        .from('users')
        .insert(testUser)
        .select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Successfully inserted:', data);
    }
}

testInsert();
