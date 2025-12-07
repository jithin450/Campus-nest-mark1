import { supabase } from '@/integrations/supabase/client';

const sampleRestaurants = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Spice Garden Restaurant',
    address: '123 Food Street, College Town',
    city: 'College Town',
    state: 'State',
    description: 'Authentic Indian restaurant serving traditional South Indian cuisine with a modern twist. Known for its aromatic spices and fresh ingredients.',
    short_description: 'Authentic Indian cuisine with aromatic spices and fresh ingredients',
    cuisine_type: 'Indian',
    rating: 4.5,
    price_range: '₹300-400',
    images: ['/placeholder.svg', '/placeholder.svg'],
    total_reviews: 127,
    opening_hours: '11:00 AM - 10:00 PM',
    contact_number: '+91-9876543210',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Dragon Palace Chinese',
    address: '456 Campus Road, College Town',
    city: 'College Town',
    state: 'State',
    description: 'Premium Chinese restaurant offering authentic Szechuan and Cantonese dishes. Features live cooking stations and elegant ambiance.',
    short_description: 'Premium Chinese restaurant with live cooking stations',
    cuisine_type: 'Chinese',
    rating: 4.7,
    price_range: '₹400-500',
    images: ['/placeholder.svg', '/placeholder.svg'],
    total_reviews: 203,
    opening_hours: '12:00 PM - 11:00 PM',
    contact_number: '+91-9876543211',
    created_at: '2024-01-20T14:15:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Mama Mia Pizzeria',
    address: '789 University Avenue, College Town',
    city: 'College Town',
    state: 'State',
    description: 'Cozy Italian restaurant specializing in wood-fired pizzas and fresh pasta. Family-friendly atmosphere with authentic Italian flavors.',
    short_description: 'Cozy Italian restaurant with wood-fired pizzas',
    cuisine_type: 'Italian',
    rating: 4.3,
    price_range: '₹350-450',
    images: ['/placeholder.svg', '/placeholder.svg'],
    total_reviews: 156,
    opening_hours: '11:30 AM - 10:30 PM',
    contact_number: '+91-9876543212',
    created_at: '2024-02-01T09:45:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Global Fusion Cafe',
    address: '321 Elite Avenue, College Town',
    city: 'College Town',
    state: 'State',
    description: 'Multi-cuisine restaurant offering a diverse menu from around the world. Perfect for groups with varied taste preferences.',
    short_description: 'Multi-cuisine restaurant with diverse global menu',
    cuisine_type: 'Multi-cuisine',
    rating: 4.2,
    price_range: '₹250-350',
    images: ['/placeholder.svg', '/placeholder.svg'],
    total_reviews: 89,
    opening_hours: '10:00 AM - 11:00 PM',
    contact_number: '+91-9876543213',
    created_at: '2024-02-10T16:20:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'The Royal Dine',
    address: '567 Heritage Lane, College Town',
    city: 'College Town',
    state: 'State',
    description: 'Upscale fine dining restaurant with royal ambiance. Specializes in North Indian and Mughlai cuisine with premium ingredients.',
    short_description: 'Upscale fine dining with royal ambiance',
    cuisine_type: 'Indian',
    rating: 4.8,
    price_range: '₹600-800',
    images: ['/placeholder.svg', '/placeholder.svg'],
    total_reviews: 312,
    opening_hours: '7:00 PM - 12:00 AM',
    contact_number: '+91-9876543214',
    created_at: '2024-02-15T11:00:00Z'
  }
];

export const populateRestaurants = async () => {
  try {
    // Check if restaurants already exist
    const { data: existingRestaurants, error: checkError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing restaurants:', checkError);
      return { success: false, error: checkError };
    }

    // If restaurants already exist, don't insert again
    if (existingRestaurants && existingRestaurants.length > 0) {
      console.log('Restaurants already exist in database');
      return { success: true, message: 'Restaurants already exist' };
    }

    // Insert sample restaurants
    const { data, error } = await supabase
      .from('restaurants')
      .insert(sampleRestaurants);

    if (error) {
      console.error('Error inserting restaurants:', error);
      return { success: false, error };
    }

    console.log('Sample restaurants inserted successfully');
    return { success: true, data };
  } catch (error) {
    console.error('Error populating restaurants:', error);
    return { success: false, error };
  }
};