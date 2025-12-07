// Test login functionality to debug the issue
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with hardcoded values
const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function testLogin() {
  console.log('Testing Supabase connection...');
  
  // Test connection
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Connection test:', { data, error });
  } catch (err) {
    console.error('Connection error:', err);
  }
  
  // Test with a sample login (replace with actual test credentials)
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';
  
  console.log('\nTesting login with:', testEmail);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    console.log('Login result:', { data, error });
    
    if (error) {
      console.error('Login error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    } else {
      console.log('Login successful!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
  
  // Test profiles table access
  console.log('\nTesting profiles table access...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Profiles query result:', { data, error });
  } catch (err) {
    console.error('Profiles query error:', err);
  }
}

testLogin().catch(console.error);