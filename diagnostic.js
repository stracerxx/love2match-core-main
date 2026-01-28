
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    console.log('--- ADVANCED DATABASE DIAGNOSTIC ---');

    const tables = ['users', 'profiles', 'threads', 'thread_participants', 'messages', 'token_transactions'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);

        // Check row count and column types of the first row
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`  Query Error: ${error.message}`);
        } else {
            console.log(`  Data Rows: ${data.length > 0 ? 'Yes' : 'No'}`);
            if (data[0]) {
                const row = data[0];
                for (const col of Object.keys(row)) {
                    if (col.includes('id') || col.includes('user')) {
                        console.log(`  Column: ${col} = ${row[col]} (JS Type: ${typeof row[col]})`);
                    }
                }
            }
        }
    }
}

diagnose();
