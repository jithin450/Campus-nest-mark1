import { populateHostels } from './populateHostels';
import { populateRestaurants } from './populateRestaurants';

export const setupDatabase = async () => {
  console.log('Starting database setup...');
  
  try {
    // Populate hostels
    console.log('Populating hostels...');
    const hostelsResult = await populateHostels();
    console.log('Hostels result:', hostelsResult);
    
    // Populate restaurants
    console.log('Populating restaurants...');
    const restaurantsResult = await populateRestaurants();
    console.log('Restaurants result:', restaurantsResult);
    
    console.log('Database setup completed successfully!');
    return {
      success: true,
      hostels: hostelsResult,
      restaurants: restaurantsResult
    };
  } catch (error) {
    console.error('Database setup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Auto-run setup only in dev server, not during tests/build
if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
  console.log('Development mode detected - running database setup...');
  setupDatabase();
}
