import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import PopulateHostels from '@/components/PopulateHostels';
import PopulateRestaurants from '@/components/PopulateRestaurants';
import TestConnection from '@/components/TestConnection';
import DebugInfo from '@/components/DebugInfo';
import SimpleTest from '@/components/SimpleTest';
import NetworkTest from '@/components/NetworkTest';
import SimpleConnectionTest from '@/components/SimpleConnectionTest';
import DatabaseCheck from '@/components/DatabaseCheck';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import DirectDatabaseTest from '@/components/DirectDatabaseTest';
import EnhancedConnectionTest from '@/components/EnhancedConnectionTest';
import { setupDatabase } from '@/utils/setupDatabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Setup = () => {
  const [setupStatus, setSetupStatus] = useState<string>('Not started');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetupDatabase = async () => {
    setIsLoading(true);
    setSetupStatus('Running database setup...');
    
    try {
      alert('🚀 Manual database setup triggered');
      const result = await setupDatabase();
      alert(`📊 Setup result: ${JSON.stringify(result)}`);
      if (result.success) {
        setSetupStatus('Database setup completed successfully! ✅');
        alert('✅ Database setup completed successfully!');
      } else {
        setSetupStatus(`Database setup failed: ${result.error} ❌`);
        alert(`❌ Database setup failed: ${result.error}`);
      }
    } catch (error) {
      setSetupStatus(`Database setup error: ${error} ❌`);
      alert(`❌ Database setup error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Campus Nest Setup & Testing
          </h1>
          
          <div className="grid gap-6 md:grid-cols-2">
             <Card>
               <CardHeader>
                 <CardTitle>Database Setup</CardTitle>
                 <CardDescription>Populate database with sample data</CardDescription>
               </CardHeader>
               <CardContent>
                 <button 
                   onClick={handleSetupDatabase}
                   disabled={isLoading}
                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                 >
                   {isLoading ? 'Setting up...' : 'Setup Database'}
                 </button>
                 <p className="mt-2 text-sm text-gray-600">{setupStatus}</p>
               </CardContent>
             </Card>
             
             <DatabaseCheck />
             <SupabaseConnectionTest />
             <DirectDatabaseTest />
             <EnhancedConnectionTest />
             <PopulateHostels />
             <PopulateRestaurants />
             <TestConnection />
             <DebugInfo />
             <SimpleConnectionTest />
             <SimpleTest />
             <NetworkTest />
           </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Places to Visit</CardTitle>
              <CardDescription>
                Places to visit data is automatically populated through database migrations. No manual setup required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-green-600 font-medium">
                ✓ Places data available via migrations
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Setup;