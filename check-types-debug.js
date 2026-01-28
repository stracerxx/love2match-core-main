
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExactTypes() {
    console.log('--- CHECKING EXACT COLUMN TYPES ---');

    // We'll try to find a system table that is usually accessible
    // If not, we can infer from pg_typeof(column)

    async function getColType(table, col) {
        // This is a hack to get type using Postgres functions via a filter or similar if possible
        // But since we can only use select, it's hard.
        // Let's try to query a non-existent column to see the table schema in the error OR just use a known-working RPC if any.

        const { data, error } = await supabase.from(table).select(col).limit(1);
        if (data && data.length > 0) {
            console.log(`${table}.${col} value:`, data[0][col], 'Type:', typeof data[0][col]);
        } else if (error) {
            console.log(`Error on ${table}.${col}:`, error.message);
        } else {
            console.log(`${table}.${col}: No data to check type from.`);
        }
    }

    await getColType('messages', 'sender_id');
    await getColType('thread_participants', 'user_id');
    await getColType('token_transactions', 'user_id');
}

checkExactTypes();
