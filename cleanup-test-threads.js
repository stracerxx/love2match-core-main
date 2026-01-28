
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
    console.log('--- CLEANING UP EMPTY TEST THREADS ---');

    // 1. Get all threads
    const { data: threads, error: threadErr } = await supabase.from('threads').select('id');
    if (threadErr) { console.error('Error fetching threads:', threadErr.message); return; }

    console.log(`Checking ${threads.length} threads...`);
    let deletedCount = 0;

    for (const thread of threads) {
        // 2. Check for messages in this thread
        const { count, error: countErr } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id);

        if (countErr) {
            console.error(`Error counting messages for thread ${thread.id}:`, countErr.message);
            continue;
        }

        // 3. If no messages, delete the thread
        if (count === 0) {
            console.log(`Deleting empty thread: ${thread.id}`);
            const { error: delErr } = await supabase.from('threads').delete().eq('id', thread.id);
            if (delErr) {
                console.error(`Error deleting thread ${thread.id}:`, delErr.message);
            } else {
                deletedCount++;
            }
        }
    }

    console.log(`\nCleanup complete. Deleted ${deletedCount} empty threads.`);
}

cleanup().catch(console.error);
