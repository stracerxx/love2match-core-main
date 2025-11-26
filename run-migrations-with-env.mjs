import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^"|"$/g, '');
      process.env[key] = value;
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ctgqznazjyplpuwmehav.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.log('Please check your .env file and ensure SUPABASE_SERVICE_ROLE_KEY is set');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔄 Running comprehensive migrations...\n');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigrations() {
  try {
    // Read all new comprehensive migration files
    const migrations = [
      '20251125000001_add_core_entities.sql',
      '20251125000002_add_token_transactions.sql',
      '20251125000003_add_content_and_gifts.sql',
      '20251125000004_add_subscriptions_and_businesses.sql',
      '20251125000005_add_admin_functions.sql',
      '20251125000006_fix_uuid_bigint_conflict.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`📦 Processing ${migrationFile}...`);
      
      try {
        const migrationPath = path.join(process.cwd(), 'supabase/migrations', migrationFile);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log(`📝 Migration content loaded (${migrationSQL.length} chars)`);
        console.log(`📋 Please apply this migration manually via Supabase SQL Editor`);
        console.log(`   File: supabase/migrations/${migrationFile}`);
        console.log('');
      } catch (error) {
        console.log(`⚠️ Error reading ${migrationFile}: ${error.message}`);
      }
    }

    console.log('✨ Migration instructions completed!');
    console.log('\n🚨 IMMEDIATE FIX FOR UUID/BIGINT ERROR:');
    console.log('1. Go to: https://app.supabase.com/project/ctgqznazjyplpuwmehav/sql');
    console.log('2. Copy and paste the content from IMMEDIATE_FIX.sql');
    console.log('3. Execute it FIRST to fix the type conflict');
    console.log('4. Then apply the comprehensive migrations (00001-00006)');
    console.log('\n📋 COMPREHENSIVE MIGRATIONS:');
    console.log('1. Apply migrations in order: 00001 through 00006');
    console.log('2. The new migrations handle UUID/BIGINT conflicts properly');
    console.log('3. Test the admin dashboard at: http://localhost:8080/admin');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

runMigrations();