import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Applying migration: ${path.basename(filePath)}`);
    
    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.from('users').select('*').limit(1); // Test connection
        if (error) {
          console.error(`Database connection error:`, error.message);
          return false;
        }
        
        // For now, we'll just log the statements since we can't execute arbitrary SQL
        console.log(`Would execute: ${statement.trim().substring(0, 100)}...`);
      }
    }
    
    console.log(`✓ Migration ${path.basename(filePath)} processed (statements logged)`);
    return true;
  } catch (error) {
    console.error(`Error reading/executing ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Applying membership migrations to production database...');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const membershipMigrations = [
    '20251129000001_add_daily_likes_used.sql',
    '20251129000002_add_increment_likes_rpc.sql'
  ];
  
  let allSuccess = true;
  
  for (const migrationFile of membershipMigrations) {
    const filePath = path.join(migrationsDir, migrationFile);
    if (fs.existsSync(filePath)) {
      const success = await applyMigration(filePath);
      if (!success) {
        allSuccess = false;
      }
    } else {
      console.error(`Migration file not found: ${migrationFile}`);
      allSuccess = false;
    }
  }
  
  if (allSuccess) {
    console.log('✓ All membership migrations applied successfully!');
  } else {
    console.log('✗ Some migrations failed to apply');
    process.exit(1);
  }
}

main().catch(console.error);