
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const tid = '2a37d92b-3388-42b6-a960-af0a44000000';
    const sid = 'a8ba5cc9-df37-4980-a905-4b8c4d10139a';

    const { data, error } = await supabase.rpc('debug_input', {
        p_tid: tid,
        p_sid: sid
    });

    console.log('Data:', data);
    console.log('Error:', error?.message);
}

test();
