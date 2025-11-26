import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctgqznazjyplpuwmehav.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.log('You need the service role key to execute raw SQL.');
  console.log('Get it from: https://app.supabase.com/project/ctgqznazjyplpuwmehav/settings/api');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...\n');

    // Read migration files
    const tokensMigration = fs.readFileSync(
      path.join(process.cwd(), 'supabase/migrations/20251124230000_add_tokens.sql'),
      'utf8'
    );
    const eventsMigration = fs.readFileSync(
      path.join(process.cwd(), 'supabase/migrations/20251124235000_create_events_and_attendees.sql'),
      'utf8'
    );

    // Execute migrations
    console.log('📦 Applying token migration...');
    try {
      const result1 = await supabase.rpc('_exec_sql', { 
        sql: tokensMigration 
      }, { count: 'exact' });
      if (!result1.error) {
        console.log('✅ Token migration applied');
      } else {
        console.log('⚠️ Token migration result:', result1.error);
      }
    } catch (e) {
      console.log('⚠️ Could not verify token migration - RPC may not exist');
    }

    console.log('\n📦 Applying events migration...');
    try {
      const result2 = await supabase.rpc('_exec_sql', { 
        sql: eventsMigration 
      }, { count: 'exact' });
      if (!result2.error) {
        console.log('✅ Events migration applied');
      } else {
        console.log('⚠️ Events migration result:', result2.error);
      }
    } catch (e) {
      console.log('⚠️ Could not verify events migration - RPC may not exist');
    }

    console.log('\n✨ Migration script completed!');
    console.log('\nNote: Raw SQL execution via SDK requires a service role key.');
    console.log('For best results, apply migrations manually via Supabase SQL Editor.');
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runMigrations();
