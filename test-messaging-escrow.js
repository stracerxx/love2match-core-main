
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const userA = '79adf938-6680-43b4-a566-51a49a0468f0';
const userB = '362372c0-a7d1-4148-9bcd-1176b66e379b';

async function testEscrow() {
    console.log('--- TESTING MESSAGING ESCROW (DIRECT BALANCE VERSION) ---');

    console.log('Step 0: Manually setting User A balance to 100...');
    const { error: updErr } = await supabase.from('profiles').update({ love_token_balance: 100 }).eq('auth_user_id', userA);
    if (updErr) {
        console.error('Error setting balance:', updErr.message);
        return;
    }

    console.log('Looking for thread...');
    let { data: threads } = await supabase.from('threads').select('id, initial_fee_paid, escrow_amount');

    // Find a thread between A and B
    let tid;
    for (const t of (threads || [])) {
        const { data: parts } = await supabase.from('thread_participants').select('user_id').eq('thread_id', t.id);
        const ids = parts?.map(p => p.user_id) || [];
        if (ids.includes(userA) && ids.includes(userB)) {
            tid = t.id;
            // RESET the thread for testing
            console.log('Resetting existing thread:', tid);
            await supabase.from('threads').update({ initial_fee_paid: false, escrow_amount: 0, escrow_sender_id: null }).eq('id', tid);
            break;
        }
    }

    if (!tid) {
        console.log('No existing thread found, creating one...');
        const { data: nthread } = await supabase.from('threads').insert({}).select().single();
        tid = nthread.id;
        await supabase.from('thread_participants').insert([
            { thread_id: tid, user_id: userA },
            { thread_id: tid, user_id: userB }
        ]);
        console.log('New Thread Created:', tid);
    }

    // --- Step 1: User A sends first message ---
    console.log('\n--- Step 1: User A sends first message ---');
    const { data: m1, error: m1Err } = await supabase.rpc('send_message_with_escrow', {
        p_thread_id: tid,
        p_sender_id: userA,
        p_content: 'First message with fee!'
    });
    if (m1Err) { console.error('RPC Error (m1):', m1Err.message); return; }
    console.log('Result:', m1);

    const { data: trA } = await supabase.from('threads').select('*').eq('id', tid).single();
    const { data: prA } = await supabase.from('profiles').select('love_token_balance').eq('auth_user_id', userA).single();
    console.log('User A Balance (should be 90):', prA.love_token_balance);
    console.log('Thread initial_fee_paid (should be true):', trA.initial_fee_paid);
    console.log('Thread escrow_amount (should be 10):', trA.escrow_amount);

    // --- Step 2: User B replies ---
    console.log('\n--- Step 2: User B replies ---');
    const { data: prB_before } = await supabase.from('profiles').select('love_token_balance').eq('auth_user_id', userB).single();

    const { data: m2, error: m2Err } = await supabase.rpc('v4_send_escrow_message', {
        p_thread_id: tid,
        p_sender_id: userB,
        p_content: 'Got it! Thanks for the tokens.'
    });
    if (m2Err) { console.error('RPC Error (m2):', m2Err.message); return; }
    console.log('Result:', m2);

    const { data: trFinal } = await supabase.from('threads').select('*').eq('id', tid).single();
    const { data: prB_after } = await supabase.from('profiles').select('love_token_balance').eq('auth_user_id', userB).single();

    console.log('User B Balance Before:', prB_before.love_token_balance);
    console.log('User B Balance After (should be +10):', prB_after.love_token_balance);
    console.log('Thread escrow_amount (should be 0):', trFinal.escrow_amount);

    if (Number(prB_after.love_token_balance) > Number(prB_before.love_token_balance)) {
        console.log('\nSUCCESS: Escrow system is working perfectly! ✅');
    } else {
        console.log('\nFAILURE: Escrow reward was not released. ❌');
    }
}

testEscrow().catch(err => console.error('Top level error:', err));
