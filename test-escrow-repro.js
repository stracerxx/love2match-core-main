
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSendMessage() {
    console.log("Testing sendMessage with potential UUID error...");

    // Attempting to call escrow_v13_final with a "1" to see if it triggers the error I remember
    const { data, error } = await supabase.rpc("escrow_v13_final", {
        p_tid: '3abc1663-acb4-416d-91dd-967755333e67', // Valid thread ID (randomly picked one I saw earlier)
        p_sid: '2aa2d0d7-08b2-46bb-a387-bdf77b3e5667', // Valid sender ID
        p_content: 'Test message'
    });

    if (error) {
        console.log("Error from escrow_v13_final:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success from escrow_v13_final:", data);
    }
}

testSendMessage();
