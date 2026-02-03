
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log(`URL: ${supabaseUrl}`);
if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Querying...");
    const start = Date.now();
    const { data, count, error } = await supabase
        .from('users')
        .select('display_name, is_suspended, demographics', { count: 'exact' });

    console.log(`Took ${Date.now() - start}ms`);

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Count: ${count}`);
    data?.forEach(u => console.log(`- ${u.display_name} (Suspended: ${u.is_suspended})`));
}

check().catch(e => console.error("Outer error:", e));
