
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Querying 'users'...");
    const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    console.log("Querying 'profiles'...");
    const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    console.log(`Users table count: ${usersCount} (Error: ${usersError?.message || 'none'})`);
    console.log(`Profiles table count: ${profilesCount} (Error: ${profilesError?.message || 'none'})`);
}

check().catch(e => console.error(e));
