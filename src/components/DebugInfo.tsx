import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TestSummary {
  success: boolean;
  error?: string;
  responseTime?: number;
  count?: number | null;
  recordCount?: number;
  dataReceived?: boolean;
}

interface DebugInfoState {
  timestamp?: string;
  supabaseUrl?: string;
  hasSupabaseKey?: boolean;
  tests?: Record<string, TestSummary>;
  globalError?: string;
}

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<DebugInfoState>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDebugTests = async () => {
      const info: DebugInfoState = {
        timestamp: new Date().toISOString(),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        tests: {} as Record<string, TestSummary>
      };

      try {
        // Test 1: Basic connection
        const startTime = Date.now();
        const { data, error } = await supabase
          .from('hostels')
          .select('id')
          .limit(1);
        
        (info.tests as Record<string, TestSummary>).basicConnection = {
          success: !error,
          error: error?.message,
          responseTime: Date.now() - startTime,
          dataReceived: !!data
        };

        // Test 2: Count query
        const countStart = Date.now();
        const { count, error: countError } = await supabase
          .from('hostels')
          .select('*', { count: 'exact', head: true });
        
        (info.tests as Record<string, TestSummary>).countQuery = {
          success: !countError,
          error: countError?.message,
          responseTime: Date.now() - countStart,
          count: count
        };

        // Test 3: Full data query
        const dataStart = Date.now();
        const { data: fullData, error: dataError } = await supabase
          .from('hostels')
          .select('*')
          .limit(5);
        
        (info.tests as Record<string, TestSummary>).dataQuery = {
          success: !dataError,
          error: dataError?.message,
          responseTime: Date.now() - dataStart,
          recordCount: fullData?.length || 0
        };

        // Test 4: Restaurant table
        const { count: restaurantCount, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });
        
        (info.tests as Record<string, TestSummary>).restaurantTable = {
          success: !restaurantError,
          error: restaurantError?.message,
          count: restaurantCount
        };

        // Test 5: Places table
        const { count: placesCount, error: placesError } = await supabase
          .from('places_to_visit')
          .select('*', { count: 'exact', head: true });
        
        (info.tests as Record<string, TestSummary>).placesTable = {
          success: !placesError,
          error: placesError?.message,
          count: placesCount
        };

      } catch (err) {
        info.globalError = err instanceof Error ? err.message : 'Unknown error';
      }

      setDebugInfo(info);
      setIsLoading(false);
    };

    runDebugTests();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Running Debug Tests...</h3>
        <div className="animate-pulse mt-2">Testing database connection...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-3">Debug Information</h3>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>Environment:</strong>
          <ul className="ml-4 mt-1">
            <li>Supabase URL: {debugInfo.supabaseUrl || 'Not set'}</li>
            <li>Has API Key: {debugInfo.hasSupabaseKey ? 'Yes' : 'No'}</li>
            <li>Timestamp: {debugInfo.timestamp}</li>
          </ul>
        </div>

        {debugInfo.globalError && (
          <div className="p-2 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Global Error:</strong> {debugInfo.globalError}
          </div>
        )}

        <div>
          <strong>Test Results:</strong>
          <div className="ml-4 mt-2 space-y-2">
            {Object.entries(debugInfo.tests || {}).map(([testName, result]: [string, TestSummary]) => (
              <div key={testName} className={`p-2 rounded border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="font-medium">{testName}:</div>
                <div className={result.success ? 'text-green-700' : 'text-red-700'}>
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                {result.error && (
                  <div className="text-red-600 text-xs mt-1">Error: {result.error}</div>
                )}
                {result.responseTime && (
                  <div className="text-gray-600 text-xs">Response time: {result.responseTime}ms</div>
                )}
                {result.count !== undefined && (
                  <div className="text-gray-600 text-xs">Count: {result.count}</div>
                )}
                {result.recordCount !== undefined && (
                  <div className="text-gray-600 text-xs">Records: {result.recordCount}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
