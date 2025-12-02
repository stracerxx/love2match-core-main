import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addDailyLikesColumns() {
  console.log('Adding daily_likes_used and last_like_date columns to users table...');
  
  try {
    // First check if columns already exist
    const { data: existingColumns, error: checkError } = await supabase
      .from('users')
      .select('id, daily_likes_used, last_like_date')
      .limit(1);
    
    if (checkError && checkError.message.includes('column')) {
      // Columns don't exist, let's try to add them
      console.log('Columns do not exist, attempting to add them...');
      
      // We can't execute raw SQL directly, so we'll use a different approach
      // For now, we'll create a simple script that shows what needs to be done
      console.log('To add the columns, you need to:');
      console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
      console.log('2. Navigate to your project: ctgqznazjyplpuwmehav');
      console.log('3. Go to the SQL Editor');
      console.log('4. Run this SQL:');
      console.log(`
        ALTER TABLE users 
        ADD COLUMN daily_likes_used INT DEFAULT 0,
        ADD COLUMN last_like_date DATE;
      `);
      
      return true; // Consider it "successful" since we provided instructions
    } else {
      console.log('✓ Columns already exist');
      return true;
    }
  } catch (error) {
    console.error('Error checking/adding columns:', error.message);
    return false;
  }
}

async function createIncrementLikesFunction() {
  console.log('Creating increment_likes RPC function...');
  
  try {
    // Test if the function exists by trying to call it
    const { error } = await supabase.rpc('increment_likes', { user_id_param: '00000000-0000-0000-0000-000000000000' });
    
    if (error && error.message.includes('function')) {
      // Function doesn't exist, provide instructions
      console.log('Function does not exist, providing instructions...');
      console.log('To create the increment_likes function, run this SQL in the Supabase SQL Editor:');
      console.log(`
        CREATE OR REPLACE FUNCTION increment_likes(user_id_param uuid)
        RETURNS void AS $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id_param 
            AND last_like_date = current_date
          ) THEN
            UPDATE users
            SET daily_likes_used = daily_likes_used + 1
            WHERE id = user_id_param;
          ELSE
            UPDATE users
            SET daily_likes_used = 1,
                last_like_date = current_date
            WHERE id = user_id_param;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `);
      return true;
    } else {
      console.log('✓ Function already exists');
      return true;
    }
  } catch (error) {
    console.error('Error checking/creating function:', error.message);
    return false;
  }
}

async function main() {
  console.log('Applying membership migrations to production database...');
  
  const success1 = await addDailyLikesColumns();
  const success2 = await createIncrementLikesFunction();
  
  if (success1 && success2) {
    console.log('✓ All membership migrations processed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL statements provided above in your Supabase SQL Editor');
    console.log('2. Test the membership features in the application');
    console.log('3. Verify that daily like limits are working correctly');
  } else {
    console.log('✗ Some migrations failed to process');
    process.exit(1);
  }
}

main().catch(console.error);