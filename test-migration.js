import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load and parse CSV
const data = fs.readFileSync('user-data.csv', 'utf8');
const users = parse(data, { columns: true, skip_empty_lines: true, trim: true });

console.log(`Loaded ${users.length} users from CSV`);

// Test transformation on first few users
for (let i = 0; i < Math.min(3, users.length); i++) {
  const user = users[i];
  console.log(`\n--- User ${i + 1}: ${user.email} ---`);
  console.log('Original data:', {
    email: user.email,
    full_name: user.full_name,
    display_name: user.display_name,
    bio: user.bio,
    membership_tier: user.membership_tier,
    love_token_balance: user.love_token_balance
  });
  
  // Test field mapping
  const mappedUser = {
    email: user.email,
    full_name: user.full_name,
    display_name: user.display_name || user.full_name,
    bio: user.bio,
    membership_tier: user.membership_tier || 'standard',
    love_token_balance: user.love_token_balance ? parseInt(user.love_token_balance) : 0,
    age_verified: user.is_verified === 'true',
    is_online: user.is_online === 'true'
  };
  
  console.log('Mapped data:', mappedUser);
}