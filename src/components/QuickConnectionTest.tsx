import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Clock, Wifi } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'timeout';
  message: string;
  duration?: number;
}

const QuickConnectionTest: React.FC = () => {
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

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Basic Internet Connectivity
    updateTest('Internet', 'pending', 'Testing internet connectivity...');
    try {
      const start = Date.now();
      const response = await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      const duration = Date.now() - start;
      updateTest('Internet', 'success', `Internet connection active (${duration}ms)`, duration);
    } catch (error) {
      updateTest('Internet', 'error', `No internet connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 2: Supabase URL Reachability
    updateTest('Supabase URL', 'pending', 'Testing Supabase URL reachability...');
    try {
      const start = Date.now();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(8000)
      });
      const duration = Date.now() - start;
      if (response.ok || response.status === 401) {
        updateTest('Supabase URL', 'success', `Supabase URL reachable (${duration}ms)`, duration);
      } else {
        updateTest('Supabase URL', 'error', `Supabase URL returned status: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        updateTest('Supabase URL', 'timeout', 'Supabase URL timeout (>8s)');
      } else {
        updateTest('Supabase URL', 'error', `Supabase URL unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Test 3: Supabase Authentication
    updateTest('Auth', 'pending', 'Testing Supabase authentication...');
    try {
      const start = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const duration = Date.now() - start;
      if (error) {
        updateTest('Auth', 'error', `Auth error: ${error.message}`);
      } else {
        updateTest('Auth', 'success', `Auth working (${duration}ms)`, duration);
      }
    } catch (error) {
      updateTest('Auth', 'error', `Auth failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Simple Database Query
    updateTest('Database', 'pending', 'Testing database connection...');
    try {
      const start = Date.now();
      const { data, error } = await supabase
        .from('hostels')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      const duration = Date.now() - start;
      
      if (error) {
        updateTest('Database', 'error', `Database error: ${error.message}`);
      } else {
        updateTest('Database', 'success', `Database accessible (${duration}ms)`, duration);
      }
    } catch (error) {
      updateTest('Database', 'error', `Database failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Full Data Query (like the one causing timeout)
    updateTest('Full Query', 'pending', 'Testing full hostels query...');
    try {
      const start = Date.now();
      const { data, error } = await supabase
        .from('hostels')
        .select('*', { count: 'exact' })
        .order('rating', { ascending: false })
        .range(0, 9);
      const duration = Date.now() - start;
      
      if (error) {
        updateTest('Full Query', 'error', `Query error: ${error.message}`);
      } else {
        updateTest('Full Query', 'success', `Query successful (${duration}ms, ${data?.length || 0} records)`, duration);
      }
    } catch (error) {
      updateTest('Full Query', 'error', `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'pending': return <Wifi className="h-4 w-4 text-blue-500 animate-pulse" />;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Quick Connection Test
        </CardTitle>
        <CardDescription>
          Diagnose connection timeout issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
        </Button>
        
        {tests.length > 0 && (
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
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
          <div className="mt-4 p-3 bg-blue-50 rounded border">
            <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If Internet fails: Check your network connection</li>
              <li>• If Supabase URL fails: Check if Supabase is down or blocked</li>
              <li>• If Auth fails: Check your Supabase credentials</li>
              <li>• If Database fails: Check RLS policies and table permissions</li>
              <li>• If Full Query is slow (&gt;5s): Consider network optimization</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickConnectionTest;