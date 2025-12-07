import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [hostelsCount, setHostelsCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      alert('🔍 Testing Supabase connection...');
      setConnectionStatus('Testing connection...');
      
      // Test basic connection
      const { data, error, count } = await supabase
        .from('hostels')
        .select('*', { count: 'exact' })
        .limit(5);
      
      if (error) {
        alert(`❌ Supabase connection error: ${error.message}`);
        setError(`Connection failed: ${error.message}`);
        setConnectionStatus('Connection failed');
        return;
      }
      
      alert(`✅ Supabase connection successful! Found ${count || 0} hostels`);
      
      setHostelsCount(count || 0);
      setConnectionStatus(`Connected successfully - ${count || 0} hostels found`);
      setError(null);
      
      if (count === 0) {
        setError('Database is empty - no hostels found. Click "Setup Database" to populate.');
      }
      
    } catch (err) {
      console.error('❌ Connection test error:', err);
      setError(`Test failed: ${err}`);
      setConnectionStatus('Test failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Testing database connection and hostels table</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Status:</strong> {connectionStatus}</p>
          <p><strong>Hostels Count:</strong> {hostelsCount !== null ? hostelsCount : 'Unknown'}</p>
          {error && (
            <div className="text-red-600 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
          <button 
            onClick={testConnection}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
          >
            Retest Connection
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;