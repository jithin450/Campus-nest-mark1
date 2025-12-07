import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env file
let supabaseUrl, supabaseKey;
try {
  const envContent = readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfileIssue() {
  console.log('🔍 Debugging Profile Issue...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check Supabase connection
    console.log('\n1. Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Supabase connection successful');
    
    // Test 2: Check profiles table structure
    console.log('\n2. Checking profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access failed:', tableError.message);
      console.log('This might indicate RLS policy issues or table doesn\'t exist');
    } else {
      console.log('✅ Profiles table accessible');
      if (tableInfo && tableInfo.length > 0) {
        console.log('📋 Sample profile structure:', Object.keys(tableInfo[0]));
      } else {
        console.log('⚠️  No profiles found in table');
      }
    }
    
    // Test 3: Check authentication state
    console.log('\n3. Checking authentication state...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth check failed:', authError.message);
    } else if (!user) {
      console.log('⚠️  No authenticated user found');
      console.log('This is expected if no user is logged in');
    } else {
      console.log('✅ User authenticated:', user.id);
      
      // Test 4: Try to fetch user's profile
      console.log('\n4. Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError.message);
        console.log('Error details:', profileError);
        
        // Try alternative column name
        console.log('\n5. Trying alternative column name (user_id)...');
        const { data: altProfile, error: altError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (altError) {
          console.error('❌ Alternative fetch also failed:', altError.message);
        } else {
          console.log('✅ Profile found using user_id column:', altProfile);
        }
      } else {
        console.log('✅ Profile found:', profile);
      }
    }
    
    // Test 5: Check all profiles (to see table contents)
    console.log('\n5. Checking all profiles in table...');
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .limit(5);
    
    if (allError) {
      console.error('❌ Failed to fetch all profiles:', allError.message);
    } else {
      console.log(`✅ Found ${allProfiles.length} profiles in table`);
      allProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}, Name: ${profile.full_name || 'No name'}, Email: ${profile.email || 'No email'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Debug complete');
}

// Run the debug
debugProfileIssue().catch(console.error);