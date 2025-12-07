import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Clock, Wifi, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'timeout';
  message: string;
  duration?: number;
}

const SimpleConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, duration } : t);
      }
      return [...prev, { name, status, message, duration }];
    });
  };

  const runSimpleTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Supabase Client Initialization
    updateTest('Client Init', 'pending', 'Checking Supabase client...');
    try {
      if (supabase && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        updateTest('Client Init', 'success', 'Supabase client initialized');
      } else {
        updateTest('Client Init', 'error', 'Missing Supabase configuration');
      }
    } catch (error) {
      updateTest('Client Init', 'error', `Client error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Test 2: Simple Auth Check (no network required)
    updateTest('Auth Check', 'pending', 'Checking authentication state...');
    try {
      const start = Date.now();
      const { data: { session }, error } = await supabase.auth.getSession();
      const duration = Date.now() - start;
      
      if (error) {
        updateTest('Auth Check', 'error', `Auth error: ${error.message}`);
      } else {
        updateTest('Auth Check', 'success', session ? 'User authenticated' : 'No active session', duration);
      }
    } catch (error) {
      updateTest('Auth Check', 'error', `Auth failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Test 3: Basic Database Query with Extended Timeout
    updateTest('Database', 'pending', 'Testing database connection...');
    try {
      const start = Date.now();
      
      // Create a promise that will timeout after 15 seconds
      const queryPromise = supabase
        .from('hostels')
        .select('id')
        .limit(1)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout (15s)')), 15000)
      );
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as unknown as {
        error?: { code?: string; message?: string };
      };
      const duration = Date.now() - start;
      
      if (result.error && result.error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is OK
        updateTest('Database', 'error', `Database error: ${result.error.message}`);
      } else {
        updateTest('Database', 'success', `Database accessible (${duration}ms)`, duration);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        updateTest('Database', 'timeout', 'Database query timeout - network may be slow');
      } else {
        updateTest('Database', 'error', `Database failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    // Test 4: Count Query (lighter than full data fetch)
    updateTest('Count Query', 'pending', 'Testing count query...');
    try {
      const start = Date.now();
      
      const queryPromise = supabase
        .from('hostels')
        .select('*', { count: 'exact', head: true });
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Count timeout (10s)')), 10000)
      );
      
      const raced = await Promise.race([queryPromise, timeoutPromise]) as unknown as {
        count?: number | null;
        error?: { message?: string };
      };
      const { count, error } = raced;
      const duration = Date.now() - start;
      
      if (error) {
        updateTest('Count Query', 'error', `Count error: ${error.message}`);
      } else {
        updateTest('Count Query', 'success', `Found ${count || 0} hostels (${duration}ms)`, duration);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        updateTest('Count Query', 'timeout', 'Count query timeout - slow network detected');
      } else {
        updateTest('Count Query', 'error', `Count failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-700';
      case 'error': return 'text-red-700';
      case 'timeout': return 'text-orange-700';
      case 'pending': return 'text-blue-700';
    }
  };

  const hasTimeouts = tests.some(test => test.status === 'timeout');
  const hasErrors = tests.some(test => test.status === 'error');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Connection Diagnostics
        </CardTitle>
        <CardDescription>
          Simplified tests for slow network conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSimpleTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Diagnostics'
          )}
        </Button>
        
        {tests.length > 0 && (
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <span className="font-medium">{test.name}</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${getStatusColor(test.status)}`}>
                    {test.message}
                  </div>
                  {test.duration && (
                    <div className="text-xs text-gray-500">
                      {test.duration}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {tests.length > 0 && !isRunning && (
          <div className={`mt-4 p-4 rounded-lg border ${
            hasTimeouts ? 'bg-orange-50 border-orange-200' : 
            hasErrors ? 'bg-red-50 border-red-200' : 
            'bg-green-50 border-green-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              hasTimeouts ? 'text-orange-900' : 
              hasErrors ? 'text-red-900' : 
              'text-green-900'
            }`}>
              {hasTimeouts ? '⚠️ Slow Network Detected' : 
               hasErrors ? '❌ Connection Issues Found' : 
               '✅ Connection Working'}
            </h4>
            <div className={`text-sm space-y-1 ${
              hasTimeouts ? 'text-orange-800' : 
              hasErrors ? 'text-red-800' : 
              'text-green-800'
            }`}>
              {hasTimeouts && (
                <>
                  <p>• Your network connection is slow, causing timeouts</p>
                  <p>• The retry mechanism should help handle this automatically</p>
                  <p>• Consider using a faster internet connection if available</p>
                </>
              )}
              {hasErrors && !hasTimeouts && (
                <>
                  <p>• Check your internet connection</p>
                  <p>• Verify Supabase project is accessible</p>
                  <p>• Check browser console for detailed errors</p>
                </>
              )}
              {!hasTimeouts && !hasErrors && (
                <>
                  <p>• All connection tests passed successfully</p>
                  <p>• If you're still experiencing issues, try refreshing the page</p>
                  <p>• The retry mechanism should handle temporary network hiccups</p>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleConnectionTest;
