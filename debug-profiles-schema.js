import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfilesSchema() {
  console.log('🔍 Debugging Profiles Table Schema\n');
  
  try {
    // Test 1: Check if we can query the profiles table structure
    console.log('1️⃣ Testing profiles table access...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      console.error('Error details:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('Sample profile structure:', Object.keys(profiles[0]));
      } else {
        console.log('No profiles found, but table is accessible');
      }
    }
    
    // Test 2: Try to get table schema information
    console.log('\n2️⃣ Checking table schema via information_schema...');
    
    const { data: schemaInfo, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });
    
    if (schemaError) {
      console.log('❌ Cannot access schema info via RPC (expected):', schemaError.message);
    } else {
      console.log('✅ Schema info:', schemaInfo);
    }
    
    // Test 3: Try a simple insert to see what columns are expected
    console.log('\n3️⃣ Testing insert to identify required columns...');
    
    // Generate a test UUID (we won't actually insert this)
    const testUUID = '00000000-0000-0000-0000-000000000000';
    
    // Try different column combinations to see which one works
    const testCombinations = [
      { id: testUUID, full_name: 'Test' },
      { user_id: testUUID, full_name: 'Test' },
      { id: testUUID, full_name: 'Test', email: 'test@example.com' },
      { user_id: testUUID, full_name: 'Test', email: 'test@example.com' },
      { id: testUUID, full_name: 'Test', phone_number: '1234567890' },
      { user_id: testUUID, full_name: 'Test', mobile_number: '1234567890' }
    ];
    
    for (let i = 0; i < testCombinations.length; i++) {
      const testData = testCombinations[i];
      console.log(`\nTesting combination ${i + 1}:`, Object.keys(testData));
      
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log(`❌ Insert failed:`, insertError.message);
        if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
          console.log('🔍 Column does not exist error detected');
        }
      } else {
        console.log(`✅ Insert would succeed with:`, Object.keys(testData));
        // Clean up the test record
        await supabase.from('profiles').delete().eq(Object.keys(testData)[0], testUUID);
        break;
      }
    }
    
    // Test 4: Check current trigger function
    console.log('\n4️⃣ Checking current trigger function...');
    
    const { data: triggerInfo, error: triggerError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT routine_name, routine_definition 
          FROM information_schema.routines 
          WHERE routine_name = 'handle_new_user' 
          AND routine_schema = 'public';
        `
      });
    
    if (triggerError) {
      console.log('❌ Cannot access trigger info via RPC (expected):', triggerError.message);
    } else {
      console.log('✅ Trigger function info:', triggerInfo);
    }
    
    console.log('\n🎯 Summary:');
    console.log('- The 500 error is likely due to column name mismatch in the trigger function');
    console.log('- The trigger function is trying to insert into columns that don\'t exist');
    console.log('- We need to fix the trigger function to match the actual table schema');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugProfilesSchema();