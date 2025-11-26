# Migration Quick Start Guide

## Where to Use the Migration Tool

### 1. **Location of the Tool**
The migration tool is located in your project at:
```
scripts/user-migration-tool.js
```

### 2. **How to Run It**

**Step 1: Open Terminal in Your Project**
```bash
cd "c:\Users\gamed\OneDrive\Documents\WORKBENCH\CLEGG JOB\Lovable Versions\love2match-core-main\love2match-core-main"
```

**Step 2: Set Environment Variables**
```bash
# Set these in your terminal before running the tool
set SUPABASE_URL=your-supabase-project-url
set SUPABASE_SERVICE_KEY=your-supabase-service-role-key
set INPUT_FORMAT=csv
set INPUT_FILE=./user-data.csv
```

**Step 3: Run a Test (Dry Run)**
```bash
set DRY_RUN=true
node scripts/user-migration-tool.js
```

**Step 4: Run Actual Migration**
```bash
set DRY_RUN=false
node scripts/user-migration-tool.js
```

### 3. **Where to Put Your Data Files**

Place your CSV or JSON files in the project root directory:
```
love2match-core-main/
├── scripts/
│   └── user-migration-tool.js
├── user-data.csv          <-- PUT YOUR CSV FILE HERE
├── users.json             <-- PUT YOUR JSON FILE HERE
└── ...
```

### 4. **Complete Example Commands**

**For CSV Files:**
```bash
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
set INPUT_FORMAT=csv
set INPUT_FILE=./user-data.csv
set DRY_RUN=true
node scripts/user-migration-tool.js
```

**For JSON Files:**
```bash
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
set INPUT_FORMAT=json
set INPUT_FILE=./users.json
set DRY_RUN=true
node scripts/user-migration-tool.js
```

### 5. **Getting Your Supabase Credentials**

1. Go to your Supabase project dashboard
2. Click on Settings → API
3. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **service_role key** → Use as `SUPABASE_SERVICE_KEY`

### 6. **Expected Output**

When you run the tool, you'll see:
```
[2024-01-01T00:00:00.000Z] [INFO] Starting user data migration...
[2024-01-01T00:00:00.100Z] [INFO] Loaded 150 users for migration
[2024-01-01T00:00:00.200Z] [INFO] Processing batch 1/3
[2024-01-01T00:00:00.300Z] [INFO] Progress: 10/150
...
[2024-01-01T00:00:05.000Z] [INFO] Migration completed!
[2024-01-01T00:00:05.001Z] [INFO] Total users: 150
[2024-01-01T00:00:05.002Z] [INFO] Successful: 145
[2024-01-01T00:00:05.003Z] [INFO] Failed: 3
[2024-01-01T00:00:05.004Z] [INFO] Skipped (already exists): 2
```

### 7. **Troubleshooting**

**If you get "module not found" errors:**
```bash
npm install @supabase/supabase-js csv-parse
```

**If you get permission errors:**
- Make sure you're using the **service_role** key, not the anon key
- Ensure your Supabase project has the Love2Match schema deployed

**If you get file not found errors:**
- Check that your CSV/JSON file is in the project root directory
- Verify the filename matches what you set in `INPUT_FILE`

### 8. **Next Steps After Migration**

1. **Verify Data**: Check your Supabase dashboard to see the migrated users
2. **Test Login**: Try logging in with migrated user accounts
3. **Check Profiles**: Verify profile data was migrated correctly
4. **Review Errors**: Check any generated error reports for issues

The tool will create error reports as JSON files if any migrations fail, so you can fix issues and re-run.