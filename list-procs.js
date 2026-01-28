
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listFunctions() {
    console.log('--- RPC FUNCTIONS LIST ---');
    // We'll try to use a dummy select from pg_proc if possible, or just guess via common names.
    // However, Supabase usually doesn't expose pg_proc via the API.
    // But we can try to use standard filters if they are exposed in the schema cache.
    const { data: procs, error } = await supabase.from('pg_proc').select('proname').ilike('proname', '%message%');
    console.log('Procs:', procs, 'Error:', error?.message);
}

listFunctions();
