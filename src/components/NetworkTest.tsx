import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'timeout';
  duration?: number;
  message: string;
}

const NetworkTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, ...updates } : t);
      } else {
        return [...prev, { name, status: 'pending', message: '', ...updates }];
      }
    });
  };

  const runTest = async (name: string, testFn: () => Promise<unknown>, timeoutMs = 15000) => {
    const startTime = Date.now();
    updateTest(name, { status: 'pending', message: 'Testing...' });
    
    try {
      const result = await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);
      
      const duration = Date.now() - startTime;
      updateTest(name, {
        status: 'success',
        message: `Success (${duration}ms)`,
        duration
      });
      console.log(`✅ ${name} successful in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const isTimeout = error instanceof Error && error.message.includes('Timeout');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Enhanced error handling with better user feedback
      let displayMessage = errorMessage;
      if (errorMessage.includes('CORS') || errorMessage.includes('ERR_ABORTED')) {
        displayMessage = 'CORS restriction (expected for external URLs)';
      } else if (errorMessage.includes('Failed to fetch')) {
        displayMessage = 'Network error: Unable to reach server';
        console.warn(`🌐 ${name}: Network connectivity issue detected`);
      } else if (isTimeout) {
        displayMessage = `Connection timed out after ${timeoutMs}ms`;
        console.warn(`⏰ ${name}: Connection timeout - this may indicate network or server issues`);
      }
      
      console.error(`❌ ${name} failed:`, errorMessage);
      
      updateTest(name, {
        status: isTimeout ? 'timeout' : 'error',
        message: displayMessage,
        duration
      });
      throw error;
    }
  };

  const runNetworkTests = async () => {
    setIsRunning(true);
    setTests([]);

    try {
      // Test 1: Basic internet connectivity
      await runTest('Internet Connection', async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return { connected: true };
      }, 15000);

      // Test 2: Supabase URL reachability
      await runTest('Supabase URL Reachability', async () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) throw new Error('Supabase URL not configured');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return { status: response.status, reachable: true };
      }, 15000);

      // Test 3: Supabase Auth
      await runTest('Supabase Authentication', async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { hasSession: !!data.session, authWorking: true };
      }, 15000);

      // Test 4: Simple database query
      await runTest('Database Query Test', async () => {
        const { data, error } = await supabase
          .from('hostels')
          .select('count', { count: 'exact', head: true });
        if (error) throw error;
        return { queryWorking: true };
      }, 20000);

      // Test 5: Full hostels query (like the actual page)
      await runTest('Full Hostels Query', async () => {
        const { data, error, count } = await supabase
          .from('hostels')
          .select('*', { count: 'exact' })
          .order('rating', { ascending: false })
          .limit(5);
        if (error) throw error;
        return { count, dataLength: data?.length || 0 };
      }, 30000);

    } catch (error) {
      console.error('Network test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runNetworkTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Wifi className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'timeout': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const overallStatus = tests.length > 0 ? (
    tests.every(t => t.status === 'success') ? 'All tests passed' :
    tests.some(t => t.status === 'timeout') ? 'Some tests timed out' :
    'Some tests failed'
  ) : 'Running tests...';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            {tests.every(t => t.status === 'success') && tests.length > 0 ? 
              <Wifi className="h-5 w-5 text-green-500 mr-2" /> :
              <WifiOff className="h-5 w-5 text-red-500 mr-2" />
            }
            Network & Database Connectivity
          </span>
          <Button 
            onClick={runNetworkTests} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? 'Testing...' : 'Retest'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge variant={tests.every(t => t.status === 'success') && tests.length > 0 ? 'default' : 'destructive'}>
            {overallStatus}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center">
                {getStatusIcon(test.status)}
                <span className="ml-2 font-medium">{test.name}</span>
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

        {tests.some(t => t.status === 'timeout' || t.status === 'error') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify Supabase service status</li>
              <li>• Try refreshing the page</li>
              <li>• Check if you're behind a firewall or VPN</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NetworkTest;
