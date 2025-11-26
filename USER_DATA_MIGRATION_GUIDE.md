# User Data Migration Guide

This guide explains how to migrate user data from previous versions of the app to the new Love2Match schema.

## Overview

The migration tool supports both CSV and JSON input formats and handles the transformation of user data from various legacy schemas to the new Love2Match database structure.

## Migration Tool

The main migration tool is located at: [`scripts/user-migration-tool.js`](scripts/user-migration-tool.js)

### Prerequisites

1. **Environment Setup**:
   - Node.js 18+ 
   - Supabase project with the Love2Match schema deployed
   - Required environment variables (see below)

2. **Required Environment Variables**:
   ```bash
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_KEY=your-supabase-service-role-key
   INPUT_FORMAT=csv|json
   INPUT_FILE=path/to/your/data.file
   ```

### Usage

#### 1. Dry Run (Recommended First Step)
```bash
DRY_RUN=true INPUT_FORMAT=csv INPUT_FILE=./user-data.csv node scripts/user-migration-tool.js
```

#### 2. Actual Migration
```bash
INPUT_FORMAT=csv INPUT_FILE=./user-data.csv node scripts/user-migration-tool.js
```

#### 3. With Additional Options
```bash
INPUT_FORMAT=json INPUT_FILE=./users.json BATCH_SIZE=100 LOG_LEVEL=debug node scripts/user-migration-tool.js
```

## Data Format Requirements

### CSV Format
Your CSV file should have a header row with column names. The tool will automatically map common field names.

**Example CSV structure:**
```csv
id,email,username,display_name,full_name,date_of_birth,gender,bio,location,photos,interests
user1@example.com,user1@example.com,user1,User One,User One,1990-01-01,male,"Bio text","New York, NY","[{\"url\":\"photo1.jpg\"}]","hiking,reading"
```

### JSON Format
Your JSON file should be an array of user objects.

**Example JSON structure:**
```json
[
  {
    "id": "uuid-here",
    "email": "user1@example.com",
    "username": "user1",
    "display_name": "User One",
    "full_name": "User One",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "bio": "Bio text",
    "location": "New York, NY",
    "photos": [{"url": "photo1.jpg"}],
    "interests": ["hiking", "reading"]
  }
]
```

## Field Mapping

The tool automatically maps common field names. Here's the mapping logic:

### Basic Information
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `id` | `id` | User UUID |
| `email` | `email` | User email |
| `username` | `display_name` | Public display name |
| `display_name` | `display_name` | Public display name |
| `full_name` | `full_name` | Full legal name |
| `date_of_birth` | `date_of_birth` | YYYY-MM-DD format |
| `age` | `calculated` | Calculated from date_of_birth |

### Profile Information
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `bio` | `bio` | User biography |
| `gender` | `gender` | male/female/non-binary/other |
| `gender_preference` | `gender_preference` | Array of preferred genders |
| `location` | `home_city` | User's home city |
| `city` | `home_city` | User's home city |
| `latitude` | `latitude` | Home location latitude |
| `longitude` | `longitude` | Home location longitude |

### Professional Information
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `occupation` | `occupation` | User's occupation |
| `education` | `education` | Education level |

### Media and Photos
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `photos` | `photos` | Array of photo objects |
| `profile_pictures` | `photos` | Array of photo objects |
| `videos` | `profile_videos` | Array of video objects |

### Interests and Preferences
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `interests` | `interests` | Array of interests |
| `tags` | `tags` | Array of tags |
| `lifestyle_tags` | `lifestyle_tags` | Array of lifestyle tags |
| `relationship_goals` | `relationship_goals` | Array of relationship goals |

### Membership and Status
| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `membership_level` | `membership_tier` | standard/plus/premium |
| `is_premium` | `membership_tier` | true → "premium" |
| `is_verified` | `age_verified` | Age verification status |
| `is_online` | `is_online` | Online status |
| `last_seen` | `last_active` | Last active timestamp |

## Special Transformations

### Membership Tiers
- `is_premium: true` → `membership_tier: "premium"`
- `membership_level: "plus"` → `membership_tier: "plus"`
- Default: `membership_tier: "standard"`

### Age Calculation
If only `age` is provided without `date_of_birth`, the tool calculates an approximate birth year.

### Array Fields
String arrays are automatically converted:
- `"hiking,reading,music"` → `["hiking", "reading", "music"]`
- JSON strings are parsed if valid

### Photo Structure
Photos are normalized to the expected format:
```json
{
  "url": "photo-url.jpg",
  "is_primary": false,
  "is_plus_only": false
}
```

## Validation and Error Handling

### Pre-Migration Checks
1. **File Validation**: Verifies input file exists and is readable
2. **Format Validation**: Validates CSV/JSON structure
3. **Required Fields**: Ensures email and display_name are present

### Error Handling
- **Duplicate Users**: Skipped with warning
- **Invalid Data**: Logged with details
- **Database Errors**: Retried with exponential backoff

### Error Reports
Failed migrations generate error reports in JSON format:
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "stats": {
    "total": 100,
    "processed": 100,
    "successful": 95,
    "failed": 3,
    "skipped": 2
  },
  "errors": [
    {
      "user": "user@example.com",
      "error": "Database constraint violation"
    }
  ]
}
```

## Performance Optimization

### Batch Processing
- Default batch size: 50 users
- Configurable via `BATCH_SIZE` environment variable
- Parallel processing within batches

### Memory Management
- Stream processing for large files
- Automatic garbage collection
- Progress reporting every 10 users

## Rollback Strategy

### Before Migration
1. **Backup Database**: Always backup your Supabase database before migration
2. **Dry Run**: Always perform a dry run first
3. **Verify Mapping**: Check field mappings match your data

### During Migration
1. **Incremental Processing**: Process in batches to minimize risk
2. **Error Isolation**: Failed batches don't affect successful ones
3. **Detailed Logging**: Comprehensive logs for debugging

### After Migration
1. **Validation**: Verify migrated data matches expectations
2. **Testing**: Test user login and profile functionality
3. **Cleanup**: Remove temporary files and error reports

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required
   ```
   **Solution**: Set the required environment variables

2. **File Not Found**
   ```
   Error: Input file not found: ./user-data.csv
   ```
   **Solution**: Verify file path and permissions

3. **Invalid CSV Format**
   ```
   Error: CSV parsing error
   ```
   **Solution**: Check CSV structure and encoding

4. **Database Connection Issues**
   ```
   Error: Database error: connection refused
   ```
   **Solution**: Verify Supabase URL and service key

### Debug Mode
Enable detailed logging:
```bash
LOG_LEVEL=debug node scripts/user-migration-tool.js
```

## Best Practices

1. **Always Test First**: Use `DRY_RUN=true` to test without making changes
2. **Backup Data**: Create database backups before migration
3. **Monitor Progress**: Use progress logs to track migration status
4. **Validate Results**: Check migrated data for accuracy
5. **Plan for Rollback**: Have a rollback plan in case of issues

## Support

If you encounter issues:
1. Check the error logs and reports
2. Verify your input data format
3. Ensure all required environment variables are set
4. Test with a small subset of data first

For additional help, refer to the Love2Match documentation or contact the development team.