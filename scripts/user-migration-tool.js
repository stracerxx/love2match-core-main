#!/usr/bin/env node

/**
 * User Data Migration Tool for Love2Match
 * 
 * This tool migrates user data from previous app versions to the new Love2Match schema.
 * Supports both CSV and JSON input formats.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  inputFormat: process.env.INPUT_FORMAT || 'csv', // 'csv' or 'json'
  inputFile: process.env.INPUT_FILE || './user-data.csv',
  dryRun: process.env.DRY_RUN === 'true',
  batchSize: parseInt(process.env.BATCH_SIZE) || 50,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Initialize Supabase client (will be created when needed)
let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Supabase URL and service key are required');
    }
    supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }
  return supabase;
}

// Field mapping from old schema to new schema
const FIELD_MAPPING = {
  // Basic user info
  'id': 'id',
  'email': 'email',
  'full_name': 'full_name',
  'display_name': 'display_name',
  
  // Profile information
  'bio': 'bio',
  'date_of_birth': 'date_of_birth',
  'gender': 'gender',
  'gender_preference': 'gender_preference',
  'home_city': 'home_city',
  'occupation': 'occupation',
  'education': 'education',
  
  // Photos and media
  'photos': 'photos',
  
  // Physical attributes
  'body_type': 'body_type',
  'skin_tone': 'skin_tone',
  'ethnicity': 'ethnicity',
  'hair_color': 'hair_color',
  'eye_color': 'eye_color',
  'height_cm': 'height_cm',
  'has_tattoos': 'has_tattoos',
  'has_piercings': 'has_piercings',
  
  // Interests and preferences
  'tags': 'tags',
  'relationship_goals': 'relationship_goals',
  'lifestyle_preferences': 'lifestyle_preferences',
  
  // Membership and status
  'membership_tier': 'membership_tier',
  'is_verified': 'age_verified',
  'is_online': 'is_online',
  'last_active': 'last_active',
  'is_content_creator': 'is_content_creator',
  'daily_likes_remaining': 'daily_likes_remaining',
  'love_token_balance': 'love_balance',
  'love2_token_balance': 'love2_balance',
  'verification_count': 'verification_count',
  'account_type': 'account_type',
  'onboarding_completed': 'onboarding_completed',
  'referral_code': 'referral_code',
  'membership_expires_at': 'membership_expires_at',
  
  // Blockchain
  'solana_wallet_address': 'solana_wallet_address',
  
  // Location
  'current_latitude': 'current_latitude',
  'current_longitude': 'current_longitude',
  'precise_location_active': 'precise_location_active',
  'discovery_preferences': 'discovery_preferences',
  
  // Creator features
  'creator_verified': 'creator_verified',
  'creator_verification_level': 'creator_verification_level',
  'creator_verified_at': 'creator_verified_at',
  'video_enabled': 'video_enabled'
};

class UserMigrationTool {
  constructor() {
    this.stats = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    };
    this.errors = [];
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (level === 'error') {
      console.error(logMessage, data || '');
    } else if (level === 'warn') {
      console.warn(logMessage, data || '');
    } else if (config.logLevel === 'debug' || level === 'info') {
      console.log(logMessage, data || '');
    }
  }

  async loadData() {
    this.log('info', `Loading data from ${config.inputFile} (format: ${config.inputFormat})`);
    
    if (!fs.existsSync(config.inputFile)) {
      throw new Error(`Input file not found: ${config.inputFile}`);
    }

    const fileContent = fs.readFileSync(config.inputFile, 'utf8');

    if (config.inputFormat === 'csv') {
      return parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else if (config.inputFormat === 'json') {
      return JSON.parse(fileContent);
    } else {
      throw new Error(`Unsupported input format: ${config.inputFormat}`);
    }
  }

  transformUserData(oldUser) {
    const newUser = {
      // Required fields with defaults
      display_name: 'User',
      full_name: 'User',
      email: 'user@example.com',
      
      // Default values for new schema
      age_verified: false,
      role: 'member',
      account_type: 'free',
      is_suspended: false,
      membership_tier: 'standard',
      daily_likes_remaining: 25,
      balances: {},
      verification_count: 0,
      photos: [],
      profile_videos: [],
      demographics: {},
      tags: [],
      discovery_preferences: {},
      is_online: false,
      created_date: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    // Map fields according to FIELD_MAPPING
    for (const [oldField, newField] of Object.entries(FIELD_MAPPING)) {
      if (oldUser[oldField] !== undefined && oldUser[oldField] !== null && newField) {
        if (typeof newUser[newField] === 'object' && !Array.isArray(newUser[newField])) {
          // Handle JSON object fields
          try {
            newUser[newField] = typeof oldUser[oldField] === 'string' 
              ? JSON.parse(oldUser[oldField])
              : oldUser[oldField];
          } catch (e) {
            newUser[newField] = oldUser[oldField];
          }
        } else if (Array.isArray(newUser[newField])) {
          // Handle array fields
          if (typeof oldUser[oldField] === 'string') {
            try {
              newUser[newField] = JSON.parse(oldUser[oldField]);
            } catch (e) {
              newUser[newField] = oldUser[oldField].split(',').map(item => item.trim());
            }
          } else if (Array.isArray(oldUser[oldField])) {
            newUser[newField] = oldUser[oldField];
          } else {
            newUser[newField] = [oldUser[oldField]];
          }
        } else {
          // Handle simple fields
          newUser[newField] = oldUser[oldField];
        }
      }
    }

    // Special transformations
    this.applySpecialTransformations(oldUser, newUser);

    // Generate referral code if not present
    if (!newUser.referral_code) {
      newUser.referral_code = this.generateReferralCode();
    }

    return newUser;
  }

  applySpecialTransformations(oldUser, newUser) {
    // Map membership levels from CSV data
    if (oldUser.membership_tier) {
      newUser.membership_tier = oldUser.membership_tier;
    }

    // Handle gender preferences
    if (oldUser.gender_preference && typeof oldUser.gender_preference === 'string') {
      try {
        newUser.gender_preference = JSON.parse(oldUser.gender_preference);
      } catch (e) {
        newUser.gender_preference = oldUser.gender_preference.split(',').map(g => g.trim());
      }
    }

    // Ensure photos array structure
    if (newUser.photos && typeof newUser.photos === 'string') {
      try {
        newUser.photos = JSON.parse(newUser.photos);
      } catch (e) {
        // If JSON parsing fails, treat as single photo URL
        newUser.photos = [{ url: newUser.photos, is_primary: true, is_plus_only: false }];
      }
    }

    // Handle boolean fields
    const booleanFields = ['is_verified', 'is_online', 'age_verified', 'has_tattoos', 'has_piercings',
                          'is_content_creator', 'onboarding_completed', 'precise_location_active',
                          'video_enabled', 'creator_verified'];
    
    booleanFields.forEach(field => {
      if (oldUser[field] !== undefined && oldUser[field] !== null && oldUser[field] !== '') {
        newUser[field] = oldUser[field] === 'true' || oldUser[field] === true;
      }
    });

    // Handle numeric fields
    const numericFields = ['love_token_balance', 'love2_token_balance', 'verification_count',
                          'daily_likes_remaining', 'height_cm', 'current_latitude', 'current_longitude'];
    
    numericFields.forEach(field => {
      if (oldUser[field] && oldUser[field] !== '') {
        newUser[field] = parseFloat(oldUser[field]) || 0;
      }
    });

    // Handle discovery preferences
    if (oldUser.discovery_preferences && typeof oldUser.discovery_preferences === 'string') {
      try {
        newUser.discovery_preferences = JSON.parse(oldUser.discovery_preferences);
      } catch (e) {
        newUser.discovery_preferences = {};
      }
    }

    // Handle tags array
    if (oldUser.tags && typeof oldUser.tags === 'string') {
      try {
        newUser.tags = JSON.parse(oldUser.tags);
      } catch (e) {
        newUser.tags = oldUser.tags.split(',').map(tag => tag.trim());
      }
    }
  }

  generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async migrateUser(userData) {
    try {
      const transformedUser = this.transformUserData(userData);
      
      if (config.dryRun) {
        this.log('info', `DRY RUN: Would migrate user ${transformedUser.email}`);
        return { success: true, dryRun: true };
      }

      // Check if user already exists
      const { data: existingUser } = await getSupabaseClient()
        .from('users')
        .select('id')
        .eq('email', transformedUser.email)
        .single();

      if (existingUser) {
        this.log('warn', `User already exists: ${transformedUser.email}`);
        return { success: false, error: 'User already exists', skipped: true };
      }

      // Insert user
      const { data, error } = await getSupabaseClient()
        .from('users')
        .insert(transformedUser)
        .select();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      this.log('info', `Successfully migrated user: ${transformedUser.email}`);
      return { success: true, data };

    } catch (error) {
      this.log('error', `Failed to migrate user: ${userData.email || 'unknown'}`, error.message);
      return { success: false, error: error.message };
    }
  }

  async runMigration() {
    try {
      this.log('info', 'Starting user data migration...');
      
      const users = await this.loadData();
      this.stats.total = users.length;
      this.log('info', `Loaded ${this.stats.total} users for migration`);

      // Process users in batches
      for (let i = 0; i < users.length; i += config.batchSize) {
        const batch = users.slice(i, i + config.batchSize);
        this.log('info', `Processing batch ${Math.floor(i/config.batchSize) + 1}/${Math.ceil(users.length/config.batchSize)}`);

        const batchPromises = batch.map(async (user, index) => {
          const result = await this.migrateUser(user);
          this.stats.processed++;
          
          if (result.success) {
            if (result.skipped) {
              this.stats.skipped++;
            } else {
              this.stats.successful++;
            }
          } else {
            this.stats.failed++;
            this.errors.push({
              user: user.email || `user-${i + index}`,
              error: result.error
            });
          }

          // Progress update
          if (this.stats.processed % 10 === 0) {
            this.log('info', `Progress: ${this.stats.processed}/${this.stats.total}`);
          }
        });

        await Promise.all(batchPromises);
      }

      this.generateReport();

    } catch (error) {
      this.log('error', 'Migration failed', error);
      process.exit(1);
    }
  }

  generateReport() {
    this.log('info', 'Migration completed!');
    this.log('info', `Total users: ${this.stats.total}`);
    this.log('info', `Successful: ${this.stats.successful}`);
    this.log('info', `Failed: ${this.stats.failed}`);
    this.log('info', `Skipped (already exists): ${this.stats.skipped}`);

    if (this.errors.length > 0) {
      this.log('warn', `Errors encountered: ${this.errors.length}`);
      const errorReport = {
        timestamp: new Date().toISOString(),
        stats: this.stats,
        errors: this.errors
      };
      
      const reportFile = `migration-errors-${Date.now()}.json`;
      fs.writeFileSync(reportFile, JSON.stringify(errorReport, null, 2));
      this.log('info', `Error report saved to: ${reportFile}`);
    }

    if (config.dryRun) {
      this.log('info', 'DRY RUN COMPLETED - No changes were made to the database');
    }
  }
}

// CLI interface
async function main() {
  console.log('Starting user migration tool...');
  
  // Check for required environment variables
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
    console.error('Usage:');
    console.error('  SUPABASE_URL=your-supabase-url');
    console.error('  SUPABASE_SERVICE_KEY=your-service-key');
    console.error('  INPUT_FORMAT=csv|json');
    console.error('  INPUT_FILE=path/to/data.file');
    console.error('  DRY_RUN=true|false');
    console.error('  node scripts/user-migration-tool.js');
    process.exit(1);
  }

  console.log('Environment variables loaded successfully');
  console.log('Supabase URL:', config.supabaseUrl);
  console.log('Input file:', config.inputFile);
  console.log('Dry run:', config.dryRun);

  const migrationTool = new UserMigrationTool();
  await migrationTool.runMigration();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default UserMigrationTool;