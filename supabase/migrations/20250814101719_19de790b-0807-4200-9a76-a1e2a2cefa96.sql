-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  cuisine_type TEXT,
  price_range TEXT,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  opening_hours TEXT,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create places_to_visit table
CREATE TABLE public.places_to_visit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT, -- tourist, historical, recreational, etc.
  entry_fee TEXT,
  opening_hours TEXT,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places_to_visit ENABLE ROW LEVEL SECURITY;

-- Create policies for restaurants (public read access)
CREATE POLICY "Anyone can view restaurants" 
ON public.restaurants 
FOR SELECT 
USING (true);

-- Create policies for places_to_visit (public read access)
CREATE POLICY "Anyone can view places to visit" 
ON public.places_to_visit 
FOR SELECT 
USING (true);

-- Add timestamp triggers
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_places_to_visit_updated_at
BEFORE UPDATE ON public.places_to_visit
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample restaurant data
INSERT INTO public.restaurants (name, description, short_description, address, city, state, cuisine_type, price_range, rating, total_reviews, opening_hours, contact_number, images) VALUES
('Spice Garden', 'Authentic Indian cuisine with traditional recipes passed down through generations. Known for our aromatic spices and fresh ingredients.', 'Traditional Indian restaurant with authentic flavors', '123 Main Street, Near NIAT Campus', 'Bangalore', 'Karnataka', 'Indian', '₹200-500', 4.5, 127, '11:00 AM - 11:00 PM', '+91 98765 43210', '{"https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"}'),
('Cafe Mocha', 'Cozy coffee shop perfect for students. Great wifi, comfortable seating, and excellent coffee and snacks.', 'Student-friendly cafe with great coffee', '456 College Road', 'Bangalore', 'Karnataka', 'Cafe', '₹100-300', 4.2, 89, '7:00 AM - 10:00 PM', '+91 98765 43211', '{"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400"}'),
('Pizza Corner', 'Fresh Italian pizzas made with imported ingredients. Student discounts available on weekdays.', 'Italian pizza restaurant with student deals', '789 University Avenue', 'Bangalore', 'Karnataka', 'Italian', '₹300-600', 4.0, 156, '12:00 PM - 12:00 AM', '+91 98765 43212', '{"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400", "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400"}'),
('Burger Barn', 'Gourmet burgers and fries. Quick service perfect for busy students between classes.', 'Quick gourmet burgers for students', '321 Campus Street', 'Bangalore', 'Karnataka', 'Fast Food', '₹150-400', 3.8, 203, '10:00 AM - 11:00 PM', '+91 98765 43213', '{"https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400", "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"}');

-- Insert sample places to visit data
INSERT INTO public.places_to_visit (name, description, short_description, address, city, state, category, entry_fee, opening_hours, rating, total_reviews, contact_number, images) VALUES
('Lalbagh Botanical Garden', 'Historic botanical garden spread over 240 acres with rare plant species, beautiful landscapes, and the famous glass house modeled after Crystal Palace.', 'Historic botanical garden with diverse flora', 'Mavalli, Lalbagh Main Road', 'Bangalore', 'Karnataka', 'Recreational', 'Free', '6:00 AM - 7:00 PM', 4.6, 2847, '+91 80 2657 0218', '{"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400"}'),
('Bangalore Palace', 'Magnificent palace built in Tudor style architecture, showcasing the grandeur of the Mysore royal family with beautiful interiors and artifacts.', 'Tudor-style palace with royal heritage', 'Vasanth Nagar, Palace Road', 'Bangalore', 'Karnataka', 'Historical', '₹230 for Indians, ₹460 for Foreigners', '10:00 AM - 5:30 PM', 4.3, 1567, '+91 80 2336 0818', '{"https://images.unsplash.com/photo-1539650116574-75c0c6d73d1e?w=400", "https://images.unsplash.com/photo-1566404791232-af9fe0ae8f8b?w=400"}'),
('Cubbon Park', 'Large green space in the heart of the city, perfect for morning walks, jogging, and relaxation. Features several monuments and museums.', 'Central park perfect for recreation', 'Kasturba Road, Central Bangalore', 'Bangalore', 'Karnataka', 'Recreational', 'Free', '6:00 AM - 6:00 PM', 4.4, 3521, '+91 80 2286 4363', '{"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400", "https://images.unsplash.com/photo-1573160813959-df05c1b39c50?w=400"}'),
('Innovative Film City', 'Entertainment destination with movie sets, amusement rides, adventure activities, and live shows. Great for a fun day out with friends.', 'Entertainment complex with rides and shows', 'Bidadi, Bangalore-Mysore Highway', 'Bangalore', 'Karnataka', 'Entertainment', '₹600-1200 (varies by package)', '10:00 AM - 6:00 PM', 4.1, 892, '+91 80 2783 4444', '{"https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400", "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400"}');