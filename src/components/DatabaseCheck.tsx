import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, Database } from 'lucide-react';

type TableName = 'hostels' | 'restaurants' | 'places_to_visit';

interface TableStatus {
  name: TableName;
  count: number | null;
  error: string | null;
  status: 'checking' | 'success' | 'error';
}

const DatabaseCheck: React.FC = () => {
  const [tables, setTables] = useState<TableStatus[]>([
    { name: 'hostels', count: null, error: null, status: 'checking' },
    { name: 'restaurants', count: null, error: null, status: 'checking' },
    { name: 'places_to_visit', count: null, error: null, status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkTableData = async (tableName: TableName): Promise<{ count: number | null; error: string | null }> => {
    try {
      console.log(`Checking ${tableName} table...`);
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`Error checking ${tableName}:`, error);
        return { count: null, error: error.message };
      }
      
      console.log(`${tableName} table has ${count} records`);
      return { count, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Exception checking ${tableName}:`, errorMessage);
      return { count: null, error: errorMessage };
    }
  };

  const checkAllTables = async () => {
    setIsChecking(true);
    console.log('Starting database check...');
    
    const updatedTables = await Promise.all(
      tables.map(async (table) => {
        const result = await checkTableData(table.name);
        return {
          ...table,
          count: result.count,
          error: result.error,
          status: result.error ? 'error' as const : 'success' as const
        };
      })
    );
    
    setTables(updatedTables);
    setIsChecking(false);
    console.log('Database check completed');
  };

  useEffect(() => {
    checkAllTables();
  }, []);

  const getStatusIcon = (status: TableStatus['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Database className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: TableStatus['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const totalRecords = tables.reduce((sum, table) => sum + (table.count || 0), 0);
  const hasErrors = tables.some(table => table.error);
  const isEmpty = tables.every(table => table.count === 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Status Check
          </span>
          <Button 
            onClick={checkAllTables} 
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? 'Checking...' : 'Recheck'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge variant={hasErrors ? 'destructive' : isEmpty ? 'secondary' : 'default'}>
            {hasErrors ? 'Database Errors' : isEmpty ? 'No Data Found' : `${totalRecords} Total Records`}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {tables.map((table) => (
            <div key={table.name} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center">
                {getStatusIcon(table.status)}
                <span className="ml-2 font-medium capitalize">{table.name.replace('_', ' ')}</span>
              </div>
              <div className="text-right">
                {table.error ? (
                  <div className="text-sm text-red-600">
                    Error: {table.error}
                  </div>
                ) : (
                  <div className={`text-sm ${getStatusColor(table.status)}`}>
                    {table.count !== null ? `${table.count} records` : 'Checking...'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {isEmpty && !hasErrors && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>No data found!</strong> This explains why hostels, restaurants, and places aren't showing. 
              Use the PopulateHostels and PopulateRestaurants buttons above to add sample data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseCheck;