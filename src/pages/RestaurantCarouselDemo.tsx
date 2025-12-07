"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import RestaurantCarousel from "@/components/ui/RestaurantCarousel";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  description: string;
  cuisine: string;
  rating: number;
  average_price: number;
  amenities: string[];
  images: string[];
  created_at: string;
}

const RestaurantCarouselDemo = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load restaurant data from restaurants-details.txt
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        // Sample restaurant data from restaurants-details.txt
        const sampleData: Restaurant[] = [
          {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "name": "Spice Garden Restaurant",
            "address": "123 Food Street, College Town, State, India",
            "city": "College Town",
            "description": "Authentic Indian restaurant serving traditional South Indian cuisine with a modern twist. Known for its aromatic spices and fresh ingredients.",
            "cuisine": "Indian",
            "rating": 4.5,
            "average_price": 350,
            "amenities": ["AC", "Parking", "WiFi", "Outdoor Seating", "Home Delivery", "Card Payment"],
            "images": ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"],
            "created_at": "2024-01-15T10:30:00Z"
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "Dragon Palace Chinese",
            "address": "456 Campus Road, College Town, State, India",
            "city": "College Town",
            "description": "Premium Chinese restaurant offering authentic Szechuan and Cantonese dishes. Features live cooking stations and elegant ambiance.",
            "cuisine": "Chinese",
            "rating": 4.7,
            "average_price": 450,
            "amenities": ["AC", "Parking", "WiFi", "Private Dining", "Live Kitchen", "Valet Parking"],
            "images": ["https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop"],
            "created_at": "2024-01-20T14:15:00Z"
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440003",
            "name": "Mama Mia Pizzeria",
            "address": "789 University Avenue, College Town, State, India",
            "city": "College Town",
            "description": "Cozy Italian restaurant specializing in wood-fired pizzas and fresh pasta. Family-friendly atmosphere with authentic Italian flavors.",
            "cuisine": "Italian",
            "rating": 4.3,
            "average_price": 400,
            "amenities": ["AC", "Parking", "WiFi", "Outdoor Seating", "Kids Menu", "Wood Fired Oven"],
            "images": ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop"],
            "created_at": "2024-02-01T09:45:00Z"
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440004",
            "name": "Global Fusion Cafe",
            "address": "321 Elite Avenue, College Town, State, India",
            "city": "College Town",
            "description": "Multi-cuisine restaurant offering a diverse menu from around the world. Perfect for groups with varied taste preferences.",
            "cuisine": "Multi-cuisine",
            "rating": 4.2,
            "average_price": 300,
            "amenities": ["AC", "Parking", "WiFi", "Outdoor Seating", "Live Music", "Bar", "Buffet"],
            "images": ["https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop"],
            "created_at": "2024-02-10T16:20:00Z"
          },
          {
            "id": "550e8400-e29b-41d4-a716-446655440005",
            "name": "The Royal Dine",
            "address": "567 Heritage Lane, College Town, State, India",
            "city": "College Town",
            "description": "Upscale fine dining restaurant with royal ambiance. Specializes in North Indian and Mughlai cuisine with premium ingredients.",
            "cuisine": "Indian",
            "rating": 4.8,
            "average_price": 650,
            "amenities": ["AC", "Valet Parking", "WiFi", "Private Dining", "Live Entertainment", "Bar", "Banquet Hall"],
            "images": ["https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop", "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&h=600&fit=crop"],
            "created_at": "2024-02-15T11:00:00Z"
          }
        ];
        
        setRestaurants(sampleData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, []);

  const openCarousel = (index: number) => {
    setSelectedIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading restaurants...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant Carousel Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Click on any restaurant card to open the interactive carousel.
            Use arrow keys to navigate and Escape to close.
          </p>
          
          {/* Keyboard instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Keyboard Navigation</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div><kbd className="px-2 py-1 bg-white rounded border">←</kbd> Previous restaurant</div>
              <div><kbd className="px-2 py-1 bg-white rounded border">→</kbd> Next restaurant</div>
              <div><kbd className="px-2 py-1 bg-white rounded border">Esc</kbd> Close carousel</div>
            </div>
          </div>
        </div>

        {/* Restaurant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <Card 
              key={restaurant.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => openCarousel(index)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{restaurant.city}</span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                    </div>
                    <Badge variant="outline">₹{restaurant.average_price}</Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {restaurant.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {restaurant.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {restaurant.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{restaurant.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCarousel(index);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Restaurant Carousel */}
      <RestaurantCarousel
        restaurants={restaurants}
        isOpen={isCarouselOpen}
        onClose={closeCarousel}
        initialIndex={selectedIndex}
      />
    </div>
  );
};

export default RestaurantCarouselDemo;