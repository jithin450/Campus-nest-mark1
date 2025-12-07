import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

const SimpleTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Starting tests...');
  interface TestEntry { test: string; result: unknown; error?: unknown; timestamp: string }
  const [results, setResults] = useState<TestEntry[]>([]);

  const addResult = (test: string, result: unknown, error?: unknown) => {
    setResults(prev => [...prev, { test, result, error, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    try {
      setStatus('Testing Supabase connection...');
      
      // Test 1: Basic connection
      try {
        const { data, error } = await supabase.from('hostels').select('count', { count: 'exact', head: true });
        addResult('Basic Connection', { success: !error, error: error?.message });
      } catch (err) {
        addResult('Basic Connection', null, err);
      }

      // Test 2: Fetch hostels
      try {
        setStatus('Fetching hostels...');
        const { data, error, count } = await supabase
          .from('hostels')
          .select('*', { count: 'exact' })
          .limit(5);
        addResult('Hostels Query', { count, dataLength: data?.length, error: error?.message });
      } catch (err) {
        addResult('Hostels Query', null, err);
      }

      // Test 3: Fetch restaurants
      try {
        setStatus('Fetching restaurants...');
        const { data, error, count } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact' })
          .limit(5);
        addResult('Restaurants Query', { count, dataLength: data?.length, error: error?.message });
      } catch (err) {
        addResult('Restaurants Query', null, err);
      }

      // Test 4: Fetch places
      try {
        setStatus('Fetching places...');
        const { data, error, count } = await supabase
          .from('places_to_visit')
          .select('*', { count: 'exact' })
          .limit(5);
        addResult('Places Query', { count, dataLength: data?.length, error: error?.message });
      } catch (err) {
        addResult('Places Query', null, err);
      }

      setStatus('Tests completed!');
    } catch (error) {
      setStatus(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addResult('Overall Test', null, error);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Simple Database Test</h3>
      <div className="mb-4">
        <strong>Status:</strong> {status}
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Environment:</h4>
        <div className="text-sm bg-gray-100 p-2 rounded">
          <div>URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
          <div>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Test Results:</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="text-sm border-l-4 border-blue-500 pl-3 py-1">
              <div className="font-medium">{result.test}</div>
              <div className="text-gray-600">{result.timestamp}</div>
              {result.result && (
                <div className="bg-green-50 p-2 rounded mt-1">
                  <pre>{JSON.stringify(result.result, null, 2)}</pre>
                </div>
              )}
              {result.error && (
                <div className="bg-red-50 p-2 rounded mt-1">
                  <pre>{JSON.stringify(result.error, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleTest;
