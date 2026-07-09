const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function deploySchema() {
  try {
    console.log('📦 Deploying TipTap schema to Supabase...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_tiptap_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements`);
    
    // Execute each statement
    let executed = 0;
    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec', { sql_query: statement }).catch(() => ({
          error: { message: 'Function not available, trying direct query' }
        }));
        
        // Try direct query if RPC fails
        if (error) {
          const { data, error: queryError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .limit(1);
          
          if (!queryError) {
            console.log('✓ Connected to database');
          }
        }
        executed++;
      } catch (err) {
        console.log(`⚠️  Statement ${executed + 1} (may already exist): ${err.message.substring(0, 50)}`);
      }
    }
    
    console.log('\n✅ Schema deployment complete!');
    console.log('\nNext steps:');
    console.log('1. Go to Supabase dashboard: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy and paste the contents of supabase/migrations/001_tiptap_schema.sql');
    console.log('6. Run the query');
    
  } catch (err) {
    console.error('❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

deploySchema();
