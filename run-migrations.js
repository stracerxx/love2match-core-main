#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const supabaseKey = 'sb_publishable_1X_Wvf_zVo2w4ZW6jn3N5Q_6XSgl1nx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...\n');

    // Read migration files
    const tokensMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20251124230000_add_tokens.sql'),
      'utf8'
    );
    const eventsMigration = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20251124235000_create_events_and_attendees.sql'),
      'utf8'
    );

    // Execute migrations
    console.log('📦 Applying token migration...');
    const { error: err1 } = await supabase.rpc('exec_sql', { sql: tokensMigration });
    if (err1 && err1.message && !err1.message.includes('does not exist')) {
      console.error('❌ Token migration failed:', err1);
    } else {
      console.log('✅ Token migration applied (or already exists)');
    }

    console.log('\n📦 Applying events migration...');
    const { error: err2 } = await supabase.rpc('exec_sql', { sql: eventsMigration });
    if (err2 && err2.message && !err2.message.includes('does not exist')) {
      console.error('❌ Events migration failed:', err2);
    } else {
      console.log('✅ Events migration applied (or already exists)');
    }

    console.log('\n✨ Migrations completed!');
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runMigrations();
