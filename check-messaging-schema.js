
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const tables = ['threads', 'thread_participants', 'messages', 'token_transactions'];

    for (const table of tables) {
        console.log(`\n--- SCHEMA: ${table} ---`);
        const { data, error } = await supabase
            .rpc('get_admin_users'); // Use an RPC just to check connection, then raw query if possible

        // We'll try to use a view or a direct query to information_schema
        // Since we don't have a generic exec_sql, we'll try to find any existing view or RPC that helps.
        // Actually, we can just try to insert a dummy row and rollback or just see errors.
        // But let's try to query information_schema tables if they are exposed.

        const { data: cols, error: colErr } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', table)
            .eq('table_schema', 'public');

        if (colErr) {
            console.log(`Error ${table}:`, colErr.message);
        } else {
            console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`));
        }
    }
}

checkSchema();
