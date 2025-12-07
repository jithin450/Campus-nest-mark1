import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://umiyiwixfkkadtnnehmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Connection error:', error.message);
      return;
    }
    console.log('✓ Supabase connection successful');
    
    // Try to sign in with a test email (this will fail but show us the error)
    console.log('\nTesting sign in with test credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.log('Sign in error (expected):', signInError.message);
      console.log('Error code:', signInError.status);
    } else {
      console.log('✓ Sign in successful:', signInData.user?.email);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testLogin();