-- Create a custom RPC function to insert hostels directly via SQL
-- This bypasses the schema cache issues with the address column

CREATE OR REPLACE FUNCTION insert_hostels_direct()
RETURNS TABLE(
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First delete existing hostels (except the placeholder)
  DELETE FROM public.hostels WHERE id != '00000000-0000-0000-0000-000000000000';
  
  -- Insert new hostels using direct SQL
  INSERT INTO public.hostels (
    id, name, description, short_description, price_per_month,
    address, city, state, amenities, images,
    total_rooms, available_rooms, rating, total_reviews
  ) VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'University Heights Hostel',
    'Modern hostel with all amenities located near the main campus. Features 24/7 security, Wi-Fi, and study areas. Perfect for students looking for a comfortable and safe accommodation.',
    'Modern hostel near campus with 24/7 security',
    8500.00,
    '123 University Avenue',
    'Bangalore',
    'Karnataka',
    ARRAY['Wi-Fi', '24/7 Security', 'Study Room', 'Laundry', 'Cafeteria', 'Gym'],
    ARRAY['/placeholder.svg'],
    50,
    12,
    4.5,
    127
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Campus View Residency',
    'Premium accommodation with spectacular campus views. Fully furnished rooms with modern facilities and excellent connectivity to the university.',
    'Premium rooms with campus views',
    12000.00,
    '456 Campus Road',
    'Bangalore',
    'Karnataka',
    ARRAY['Wi-Fi', 'AC', 'Furnished', 'Balcony', 'Parking', 'Security'],
    ARRAY['/placeholder.svg'],
    30,
    8,
    4.7,
    89
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Scholar''s Den',
    'Budget-friendly hostel perfect for students. Clean, safe, and well-maintained with essential amenities. Great community atmosphere for academic success.',
    'Budget-friendly student accommodation',
    6500.00,
    '789 Education Street',
    'Bangalore',
    'Karnataka',
    ARRAY['Wi-Fi', 'Study Areas', 'Common Kitchen', 'Laundry', 'Security'],
    ARRAY['/placeholder.svg'],
    40,
    15,
    4.2,
    156
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Elite Student Residency',
    'Luxury hostel with premium amenities including gym, swimming pool, and recreational facilities. The ultimate student living experience.',
    'Luxury accommodation with premium facilities',
    15000.00,
    '321 Elite Avenue',
    'Bangalore',
    'Karnataka',
    ARRAY['Wi-Fi', 'AC', 'Gym', 'Swimming Pool', 'Recreation Room', 'Cafeteria', 'Parking'],
    ARRAY['/placeholder.svg'],
    25,
    5,
    4.8,
    73
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    short_description = EXCLUDED.short_description,
    price_per_month = EXCLUDED.price_per_month,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    amenities = EXCLUDED.amenities,
    images = EXCLUDED.images,
    total_rooms = EXCLUDED.total_rooms,
    available_rooms = EXCLUDED.available_rooms,
    rating = EXCLUDED.rating,
    total_reviews = EXCLUDED.total_reviews;
  
  -- Return the inserted hostels
  RETURN QUERY
  SELECT h.id, h.name, h.address, h.city, h.state
  FROM public.hostels h
  WHERE h.id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_hostels_direct() TO authenticated;
GRANT EXECUTE ON FUNCTION insert_hostels_direct() TO anon;