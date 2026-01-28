
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
    console.log('Probing messages table...');
    const { error: msgErr } = await supabase.from('messages').insert({ dummy_col: 'test' });
    console.log('Messages Error:', msgErr?.message);

    console.log('Probing thread_participants table...');
    const { error: partErr } = await supabase.from('thread_participants').insert({ dummy_col: 'test' });
    console.log('Participants Error:', partErr?.message);

    console.log('Probing threads table...');
    const { error: threadErr } = await supabase.from('threads').insert({ dummy_col: 'test' });
    console.log('Threads Error:', threadErr?.message);
}

probe();
