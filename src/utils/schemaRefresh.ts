import { supabase } from '@/integrations/supabase/client';

interface HostelInsert {
  id?: string;
  name: string;
  description?: string;
  short_description?: string;
  address: string;
  city: string;
  state: string;
  price_per_month: number;
  available_rooms?: number;
  total_rooms?: number;
  images?: string[];
  amenities?: string[];
  rating?: number;
  total_reviews?: number;
}

// Function to refresh Supabase schema cache with aggressive retry logic
export const refreshSupabaseSchema = async () => {
  try {
    console.log('Refreshing Supabase schema cache...');
    
    // First, try a simple query to check if the schema is accessible
    const { data: testData, error: testError } = await supabase
      .from('hostels')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('Schema test failed:', testError);
      
      // If we get a PGRST204 error, try to refresh the schema with multiple attempts
      if (testError.code === 'PGRST204') {
        console.log('PGRST204 detected, attempting aggressive schema refresh...');
        
        // Multiple refresh attempts with increasing wait times
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`Schema refresh attempt ${attempt}/3`);
          
          // Force multiple schema refresh queries
          await supabase.from('hostels').select('*').limit(0);
          await supabase.from('hostels').select('id, name').limit(0);
          await supabase.from('hostels').select('city, address').limit(0);
          
          // Progressive wait time: 2s, 4s, 6s
          const waitTime = attempt * 2000;
          console.log(`Waiting ${waitTime}ms for schema cache to refresh...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Test schema accessibility
          const { data: retestData, error: retestError } = await supabase
            .from('hostels')
            .select('id, name, city, address')
            .limit(1);
          
          if (!retestError) {
            console.log(`Schema refresh successful on attempt ${attempt}`);
            return { success: true, refreshed: true, attempts: attempt };
          }
          
          console.error(`Schema refresh attempt ${attempt} failed:`, retestError);
          
          if (attempt === 3) {
            console.error('All schema refresh attempts failed');
            return { success: false, error: retestError };
          }
        }
      }
      
      return { success: false, error: testError };
    }
    
    console.log('Schema is accessible');
    return { success: true, refreshed: false };
    
  } catch (error) {
    console.error('Error in schema refresh:', error);
    return { success: false, error };
  }
};

// Enhanced hostel insertion with aggressive schema refresh and retry logic
export const insertHostelWithSchemaRefresh = async (hostelData: HostelInsert) => {
  try {
    console.log('Attempting hostel insertion with schema refresh support...');
    
    // First attempt
    const { data, error } = await supabase
      .from('hostels')
      .insert(hostelData)
      .select();
    
    if (!error) {
      console.log('Hostel insertion successful on first attempt');
      return { success: true, data };
    }
    
    console.error('First insertion attempt failed:', error);
    
    // If we get a schema cache error, try aggressive refresh and multiple retries
    if (error.code === 'PGRST204') {
      console.log('PGRST204 schema cache error detected, starting aggressive refresh...');
      
      const refreshResult = await refreshSupabaseSchema();
      if (!refreshResult.success) {
        console.error('Schema refresh failed completely');
        return { success: false, error: refreshResult.error };
      }
      
      console.log('Schema refresh completed, attempting retries...');
      
      // Multiple retry attempts with delays
      for (let retry = 1; retry <= 3; retry++) {
        console.log(`Insertion retry attempt ${retry}/3`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retry));
        
        const { data: retryData, error: retryError } = await supabase
          .from('hostels')
          .insert(hostelData)
          .select();
        
        if (!retryError) {
          console.log(`Hostel insertion successful on retry ${retry}`);
          return { success: true, data: retryData };
        }
        
        console.error(`Retry ${retry} failed:`, retryError);
        
        // If still getting schema cache errors, try another refresh
        if (retryError.code === 'PGRST204' && retry < 3) {
          console.log('Still getting PGRST204, refreshing schema again...');
          await refreshSupabaseSchema();
        }
      }
      
      console.error('All retry attempts failed');
      return { success: false, error: error };
    }
    
    return { success: false, error };
    
  } catch (error) {
    console.error('Error in insertHostelWithSchemaRefresh:', error);
    return { success: false, error };
  }
};