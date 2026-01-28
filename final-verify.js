
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const userA = 'a8ba5cc9-df37-4980-a905-4b8c4d10139a';
const userB = '8091db35-53b5-4325-9ba4-8112a3e4ffc2';

async function verify() {
    console.log('--- STARTING HARDCODED VERIFICATION ---');

    console.log('1. Setting initial balances...');
    await supabase.from('profiles').update({ love_token_balance: 100 }).eq('auth_user_id', userA);
    await supabase.from('profiles').update({ love_token_balance: 10 }).eq('auth_user_id', userB);

    console.log('2. Creating test thread...');
    const { data: thread } = await supabase.from('threads').insert({}).select().single();
    if (!thread) { console.error('Failed to create thread'); return; }
    const tid = thread.id;

    await supabase.from('thread_participants').insert([
        { thread_id: tid, user_id: userA },
        { thread_id: tid, user_id: userB }
    ]);
    console.log('Thread:', tid);

    console.log('3. User A sending message...');
    const { data: r1, error: e1 } = await supabase.rpc('escrow_v13_final', {
        p_tid: tid,
        p_sid: userA,
        p_content: 'Test A'
    });
    if (e1) { console.error('Error A:', e1.message); return; }
    console.log('Success A');

    console.log('4. User B sending reply...');
    const { data: r2, error: e2 } = await supabase.rpc('escrow_v13_final', {
        p_tid: tid,
        p_sid: userB,
        p_content: 'Test B'
    });
    if (e2) { console.error('Error B:', e2.message); return; }
    console.log('Success B');

    const { data: pB } = await supabase.from('profiles').select('love_token_balance').eq('auth_user_id', userB).single();
    console.log('User B Final Balance:', pB.love_token_balance, '(Expected: 20)');

    if (Number(pB.love_token_balance) === 20) {
        console.log('\n✅ VERIFICATION SUCCESS!');
    } else {
        console.log('\n❌ VERIFICATION FAILED.');
    }
}

verify().catch(console.error);
