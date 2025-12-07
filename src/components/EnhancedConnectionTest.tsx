import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionTestResult {
  method: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

const EnhancedConnectionTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<ConnectionTestResult[]>([]);

  const testMethods = [
    {
      name: 'Basic Connection',
      test: async () => {
        const { data, error } = await supabase.from('hostels').select('count', { count: 'exact' });
        if (error) throw error;
        return { count: data?.length || 0 };
      }
    },
    {
      name: 'Health Check',
      test: async () => {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        return { status: response.status, statusText: response.statusText };
      }
    },
    {
      name: 'Auth Check',
      test: async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { hasSession: !!data.session };
      }
    },
    {
      name: 'Schema Check',
      test: async () => {
        const { data, error } = await (supabase as unknown as { rpc: (fn: string) => Promise<{ data: unknown; error: unknown }> }).rpc('version');
        if (error) throw error;
        return { version: data };
      }
    }
  ];

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: ConnectionTestResult[] = [];

    for (const method of testMethods) {
      try {
        const details = await method.test();
        testResults.push({
          method: method.name,
          success: true,
          details
        });
        alert(`✅ ${method.name}: Success`);
      } catch (error) {
        testResults.push({
          method: method.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        alert(`❌ ${method.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setResults([...testResults]);
    }

    setTesting(false);
    
    const successCount = testResults.filter(r => r.success).length;
    alert(`Connection tests completed: ${successCount}/${testResults.length} successful`);
  };

  const testDirectURL = async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/hostels?select=*`;
      const response = await fetch(url, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      alert(`✅ Direct URL test successful. Found ${data.length} hostels`);
    } catch (error) {
      alert(`❌ Direct URL test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Enhanced Connection Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={runAllTests}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run All Connection Tests'}
        </button>
        
        <button
          onClick={testDirectURL}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Test Direct URL
        </button>
      </div>

      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <div className="font-medium">
                  {result.success ? '✅' : '❌'} {result.method}
                </div>
                {result.error && (
                  <div className="text-xs mt-1">Error: {result.error}</div>
                )}
                {result.details && (
                  <div className="text-xs mt-1">
                    Details: {JSON.stringify(result.details)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedConnectionTest;
