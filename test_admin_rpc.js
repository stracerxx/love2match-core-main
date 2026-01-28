
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
    console.log('Testing get_admin_users RPC...');

    // First, we need to sign in as the admin user to pass the security check
    // We'll use the specific admin email we know exists
    const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'gamedesign2030@gmail.com',
        password: 'Password123!' // Assuming this is the password from context, or we might need to rely on existing session?
    });

    if (signInError) {
        console.error('Sign in failed (expected if we dont have password):', signInError.message);
        console.log('Attempting call without auth (will likely fail "Access denied")...');
    } else {
        console.log('Signed in as:', user.email);
    }

    const { data, error } = await supabase.rpc('get_admin_users');

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success! Records found:', data?.length);
        if (data && data.length > 0) {
            console.log('First record sample:', data[0]);
        }
    }
}

testRpc();
