import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://umiyiwixfkkadtnnehmz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtaXlpd2l4ZmtrYWR0bm5laG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQzOTgsImV4cCI6MjA3MDc0MDM5OH0.QE5gvAsh2gBEgHbQeBCR-OsQTOBmBn0m5y65JnavrKM'
);

async function testRPCFunction() {
  console.log('Testing insert_hostels_direct RPC function...');
  
  try {
    const { data, error } = await supabase
      .rpc('insert_hostels_direct');
    
    if (error) {
      console.error('RPC Error:', error);
    } else {
      console.log('RPC Success:', data);
    }
  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

testRPCFunction();