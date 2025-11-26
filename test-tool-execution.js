// Test if the migration tool can be executed
import UserMigrationTool from './scripts/user-migration-tool.js';

console.log('Testing migration tool execution...');

// Create a test instance
const tool = new UserMigrationTool();

// Test the logging function
tool.log('info', 'Test log message');
tool.log('error', 'Test error message');

// Test loading data
try {
  const users = await tool.loadData();
  console.log(`Successfully loaded ${users.length} users`);
  
  // Test transformation on first user
  if (users.length > 0) {
    const transformed = tool.transformUserData(users[0]);
    console.log('First user transformed successfully:', transformed.email);
  }
} catch (error) {
  console.log('Error loading data:', error.message);
}

console.log('Tool execution test completed!');