import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [hostelCount, setHostelCount] = useState<number | null>(null);
  const [restaurantCount, setRestaurantCount] = useState<number | null>(null);
  const [placesCount, setPlacesCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data: healthCheck, error: healthError } = await supabase
        .from('hostels')
        .select('count', { count: 'exact', head: true });
      
      if (healthError) {
        throw new Error(`Health check failed: ${healthError.message}`);
      }
      
      setConnectionStatus('Connected ✅');
      
      // Test each table
      const { count: hostelCountResult, error: hostelError } = await supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true });
      
      if (hostelError) {
        console.error('Hostel query error:', hostelError);
      } else {
        setHostelCount(hostelCountResult || 0);
        console.log('Hostels count:', hostelCountResult);
      }
      
      const { count: restaurantCountResult, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });
      
      if (restaurantError) {
        console.error('Restaurant query error:', restaurantError);
      } else {
        setRestaurantCount(restaurantCountResult || 0);
        console.log('Restaurants count:', restaurantCountResult);
      }
      
      const { count: placesCountResult, error: placesError } = await supabase
        .from('places_to_visit')
        .select('*', { count: 'exact', head: true });
      
      if (placesError) {
        console.error('Places query error:', placesError);
      } else {
        setPlacesCount(placesCountResult || 0);
        console.log('Places count:', placesCountResult);
      }
      
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('Failed ❌');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      
      <div className="space-y-2">
        <p><strong>Status:</strong> {connectionStatus}</p>
        
        {error && (
          <p className="text-red-600"><strong>Error:</strong> {error}</p>
        )}
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Table Counts:</h3>
          <ul className="space-y-1">
            <li>Hostels: {hostelCount !== null ? hostelCount : 'Loading...'}</li>
            <li>Restaurants: {restaurantCount !== null ? restaurantCount : 'Loading...'}</li>
            <li>Places to Visit: {placesCount !== null ? placesCount : 'Loading...'}</li>
          </ul>
        </div>
        
        <button 
          onClick={testConnection}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Again
        </button>
      </div>
    </div>
  );
};

export default TestConnection;