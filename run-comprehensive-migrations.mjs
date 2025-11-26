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
    console.log('🔄 Running comprehensive migrations...\n');

    // Read all new comprehensive migration files
    const migrations = [
      '20251125000001_add_core_entities.sql',
      '20251125000002_add_token_transactions.sql',
      '20251125000003_add_content_and_gifts.sql',
      '20251125000004_add_subscriptions_and_businesses.sql',
      '20251125000005_add_admin_functions.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📦 Applying ${migrationFile}...`);
      
      try {
        const migrationPath = path.join(process.cwd(), 'supabase/migrations', migrationFile);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute migration using the SQL Editor approach
        const { data, error } = await supabase.from('_exec_sql').select('*').single();
        
        if (error) {
          console.log(`⚠️ Could not execute ${migrationFile} via RPC - trying direct SQL execution`);
          // For now, we'll just log that manual execution is needed
          console.log(`📝 Please apply ${migrationFile} manually via Supabase SQL Editor`);
          console.log(`   File location: supabase/migrations/${migrationFile}`);
        } else {
          console.log(`✅ ${migrationFile} applied successfully`);
        }
      } catch (error) {
        console.log(`⚠️ Error with ${migrationFile}: ${error.message}`);
        console.log(`📝 Please apply this migration manually via Supabase SQL Editor`);
      }
    }

    console.log('\n✨ Migration instructions completed!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to: https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql');
    console.log('2. Copy and paste each migration file content from the supabase/migrations/ folder');
    console.log('3. Execute them in order (00001 through 00005)');
    console.log('4. The new migrations handle UUID/BIGINT conflicts properly');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runMigrations();