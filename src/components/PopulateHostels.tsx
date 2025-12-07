import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { populateHostels } from '../utils/populateHostels';

const PopulateHostels = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPopulated, setIsPopulated] = useState(false);
  const { toast } = useToast();

  const handlePopulateHostels = async () => {
    setIsLoading(true);
    try {
      console.log('PopulateHostels: Starting population process...');
      const result = await populateHostels();
      console.log('PopulateHostels: Result received:', result);
      
      if (result.success) {
        setIsPopulated(true);
        toast({
          title: "Success!",
          description: "Hostels have been populated successfully.",
        });
      } else {
        console.error('PopulateHostels: Population failed with error:', result.error);
        throw new Error(result.error?.message || 'Failed to populate hostels');
      }
    } catch (error) {
      console.error('PopulateHostels: Caught error:', error);
      toast({
        title: "Error",
        description: `Failed to populate hostels: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Hostel Database Setup</CardTitle>
        <CardDescription>
          {isPopulated 
            ? "Hostels populated successfully!" 
            : "Click the button below to populate the database with sample hostel data."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPopulated ? (
          <Button 
            onClick={handlePopulateHostels} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Populating..." : "Populate Hostels"}
          </Button>
        ) : (
          <div className="text-center text-green-600 font-medium">
            ✓ Database populated successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopulateHostels;