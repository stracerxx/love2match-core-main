
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugRpc() {
    const tid = 'e2bded08-ce9c-4b3d-a461-55cbbb1bbc26'; // From previous output
    const userA = '79adf938-6680-43b4-a566-51a49a0468f0';

    console.log('Debugging RPC with:');
    console.log('  tid:', tid);
    console.log('  userA:', userA);

    const { data, error } = await supabase.rpc('v4_send_escrow_message', {
        p_thread_id: tid,
        p_sender_id: userA,
        p_content: 'Debug message'
    });

    if (error) {
        console.error('RPC ERROR:', error);
    } else {
        console.log('RPC SUCCESS:', data);
    }
}

debugRpc();
