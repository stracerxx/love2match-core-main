
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Supabase Key defined: ${!!supabaseKey}`);

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env.production");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log("Fetching users...");
    try {
        const { data, count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact' });

        if (error) {
            console.error("Error fetching users:", error);
            return;
        }

        console.log(`Total users in DB: ${count}`);
        console.log("-----------------------------------------");
        if (data) {
            data.forEach((u, i) => {
                const coords = u.demographics?.location_lat ? `${u.demographics.location_lat}, ${u.demographics.location_lng}` : 'NULL';
                console.log(`${i + 1}. ${u.display_name} | ID: ${u.id.substring(0, 8)} | Suspended: ${u.is_suspended} | Location: ${u.demographics?.location} | Coords: ${coords}`);
            });
        }
    } catch (err) {
        console.error("Caught error:", err);
    }
}

checkUsers();
