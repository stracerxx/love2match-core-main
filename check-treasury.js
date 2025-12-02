import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Checking treasury table...');
  const { data, error } = await supabase
    .from('treasury')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Treasury table error:', error.message);
    console.log('Table likely does not exist.');
    return false;
  } else {
    console.log('Treasury table exists. Rows:', data.length);
    console.log('Sample:', data);
    return true;
  }
}

check().then(exists => {
  if (exists) {
    console.log('✅ Treasury migration already applied.');
  } else {
    console.log('❌ Treasury migration not applied.');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});