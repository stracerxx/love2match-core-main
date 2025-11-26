#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
// It's recommended to use environment variables for sensitive keys.
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_1X_Wvf_zVo2w4ZW6jn3N5Q_6XSgl1nx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMonetizationMigration() {
  try {
    console.log('🔄 Running monetization migration...\n');

    // Read monetization migration file
    const monetizationMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20251125000000_add_monetization.sql'),
      'utf8'
    );

    // Execute migration
    console.log('📦 Applying monetization migration...');
    const { error } = await supabase.rpc('exec_sql', { sql: monetizationMigration });
    if (error) throw error;

    console.log('\n✨ Monetization migration completed successfully!');
  } catch (error) {
    console.error('💥 Error running monetization migration:', error.message);
    process.exit(1);
  }
}

runMonetizationMigration();