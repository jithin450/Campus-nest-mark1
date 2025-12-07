import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DirectDatabaseTest = () => {
  const [status, setStatus] = useState('Ready to test');
  const [result, setResult] = useState<unknown>(null);

  const testDirectInsert = async () => {
    try {
      setStatus('Testing direct database function...');
      alert('🔧 Testing direct database function...');
      
      // Call the SQL function directly
      const { data, error } = await supabase.rpc('insert_hostels_direct');
      
      if (error) {
        alert(`❌ Direct function error: ${error.message}`);
        setStatus(`Error: ${error.message}`);
        setResult(null);
        return;
      }
      
      alert(`✅ Direct function success! Inserted ${data?.length || 0} hostels`);
      setStatus(`Success: Inserted ${data?.length || 0} hostels`);
      setResult(data);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`❌ Test error: ${errorMsg}`);
      setStatus(`Error: ${errorMsg}`);
      setResult(null);
    }
  };

  const testHostelsQuery = async () => {
    try {
      setStatus('Testing hostels query...');
      alert('🔍 Testing hostels query...');
      
      const { data, error, count } = await supabase
        .from('hostels')
        .select('*', { count: 'exact' })
        .limit(10);
      
      if (error) {
        alert(`❌ Query error: ${error.message}`);
        setStatus(`Query error: ${error.message}`);
        setResult(null);
        return;
      }
      
      alert(`✅ Query success! Found ${count || 0} hostels`);
      setStatus(`Query success: Found ${count || 0} hostels`);
      setResult(data);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`❌ Query test error: ${errorMsg}`);
      setStatus(`Error: ${errorMsg}`);
      setResult(null);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🔧 Direct Database Test</h3>
      
      <div className="space-y-3">
        <button 
          onClick={testDirectInsert}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Direct Insert Function
        </button>
        
        <button 
          onClick={testHostelsQuery}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Hostels Query
        </button>
      </div>
      
      <div className="mt-4">
        <p className="font-medium">Status: {status}</p>
        {result && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Result:</p>
            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectDatabaseTest;
