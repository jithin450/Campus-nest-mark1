import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { directHostelInsert } from '@/utils/directHostelInsert';

const UpdateHostelAddresses = () => {
  const { toast } = useToast();

  const handleUpdateAddresses = async () => {
    try {
      const result = await directHostelInsert();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Hostel addresses have been updated with realistic locations! You can now test the Get Directions button.",
        });
      } else {
        const errorMsg = result.error?.message || 'Unknown error';
        if (result.error?.code === 'PGRST204') {
          toast({
            title: "Schema Cache Issue",
            description: "Schema cache issue detected. Please refresh the page and try again, or contact support if the issue persists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Error updating addresses: ${errorMsg}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error updating hostel addresses:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Error",
        description: `Error: ${errorMsg}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-2">Update Hostel Addresses</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click to update hostel addresses with realistic locations (Bangalore, Karnataka) for better Google Maps directions.
      </p>
      <Button onClick={handleUpdateAddresses} className="bg-blue-600 hover:bg-blue-700">
        Update Addresses
      </Button>
    </div>
  );
};

export default UpdateHostelAddresses;