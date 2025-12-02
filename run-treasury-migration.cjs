#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z3F6bmF6anlwbHB1d21laGF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNjYwNywiZXhwIjoyMDc4OTkyNjA3fQ.PnfXRgEkfeKymst9sX_5drKW4CkP_jNSOXi8MJp0LxQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTreasuryMigration() {
  try {
    console.log('🔄 Running treasury migration...\n');

    // Read treasury migration file
    const treasuryMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20251201000001_add_treasury.sql'),
      'utf8'
    );

    console.log('📦 Applying treasury migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: treasuryMigration });
    if (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('⚠️ exec_sql function does not exist, trying alternative approach...');
        // Fallback: we can't run SQL via RPC, need manual intervention
        console.error('❌ Cannot apply migration automatically. Please run the SQL manually in Supabase SQL Editor.');
        console.log('📋 Migration file: supabase/migrations/20251201000001_add_treasury.sql');
        process.exit(1);
      } else {
        console.error('❌ Treasury migration failed:', error);
        process.exit(1);
      }
    } else {
      console.log('✅ Treasury migration applied successfully');
    }

    console.log('\n✨ Treasury migration completed!');
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runTreasuryMigration();