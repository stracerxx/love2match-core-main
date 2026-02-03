
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data && data.length > 0) {
        console.log("Keys in 'profiles' table:", Object.keys(data[0]));
        console.log("Example row:", JSON.stringify(data[0], null, 2));
    } else {
        console.log("No data in 'profiles' table.");
    }
}

inspect();
