import { supabase } from '@/integrations/supabase/client';

// Use custom RPC function to bypass schema cache issues
export const rpcHostelInsert = async () => {
  try {
    console.log('Starting RPC-based hostel insertion...');
    
    // Call the custom RPC function that handles insertion via direct SQL
    const { data, error } = await supabase.rpc('create_user_with_phone');
    
    if (error) {
      console.error('RPC hostel insertion failed:', error);
      return { success: false, error, method: 'rpc_failed' };
    }
    
    console.log('RPC hostel insertion completed successfully:', data);
    return { success: true, data, method: 'rpc_function' };
    
  } catch (error) {
    console.error('Error in rpcHostelInsert:', error);
    return { success: false, error };
  }
};