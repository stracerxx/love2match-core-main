import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, display_name, demographics')
        .ilike('email', '%@example.com');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${users.length} mock users.`);
    users.forEach(u => {
        console.log(`User: ${u.email}`);
        console.log(`Demographics Type: ${typeof u.demographics}`);
        console.log(`Demographics Value: ${JSON.stringify(u.demographics)}`);
    });
}

diagnose();
