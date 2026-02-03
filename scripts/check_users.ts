
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

    if (error) {
        console.error("Error fetching users:", error);
        return;
    }

    console.log(`Total users in DB: ${count}`);
    console.log("-----------------------------------------");
    data.forEach((u, i) => {
        const coords = u.demographics?.location_lat ? `${u.demographics.location_lat}, ${u.demographics.location_lng}` : 'NULL';
        console.log(`${i + 1}. ${u.display_name} | ID: ${u.id.substring(0, 8)} | Suspended: ${u.is_suspended} | Location: ${u.demographics?.location} | Coords: ${coords}`);
    });
}

checkUsers();
