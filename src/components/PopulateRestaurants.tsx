import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { populateRestaurants } from '../utils/populateRestaurants';

const PopulateRestaurants = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPopulated, setIsPopulated] = useState(false);
  const { toast } = useToast();

  const handlePopulateRestaurants = async () => {
    setIsLoading(true);
    try {
      console.log('PopulateRestaurants: Starting population process...');
      const result = await populateRestaurants();
      console.log('PopulateRestaurants: Result received:', result);
      
      if (result.success) {
        setIsPopulated(true);
        toast({
          title: "Success!",
          description: "Restaurants have been populated successfully.",
        });
      } else {
        console.error('PopulateRestaurants: Population failed with error:', result.error);
        throw new Error(result.error?.message || 'Failed to populate restaurants');
      }
    } catch (error) {
      console.error('PopulateRestaurants: Caught error:', error);
      toast({
        title: "Error",
        description: `Failed to populate restaurants: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Restaurant Database Setup</CardTitle>
        <CardDescription>
          {isPopulated 
            ? "Restaurants populated successfully!" 
            : "Click the button below to populate the database with sample restaurant data."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isPopulated ? (
          <Button 
            onClick={handlePopulateRestaurants} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Populating..." : "Populate Restaurants"}
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

export default PopulateRestaurants;