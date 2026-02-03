
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error("Supabase Error:", error);
        return;
    }
    if (data && data.length > 0) {
        console.log("--- PROFILES SCHEMA ---");
        Object.keys(data[0]).sort().forEach(key => {
            console.log(`COLUMN: ${key}`);
        });
        console.log("------------------------");
    } else {
        console.log("No data found in profiles table.");
    }
}

inspect();
