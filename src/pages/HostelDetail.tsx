"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Users, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocationContext } from "@/context/LocationContext";
import { getHostelSourceByLocation } from "@/utils/tableRouting";
import axios from 'axios'; // Import axios for sending SMS

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { User } from "@supabase/supabase-js";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/keyboard";

interface Hostel {
  id: string;
  name: string;
  description: string;
  location: {
    url?: string;
    display: string;
  };
  price_range: string;
  available_rooms: number;
  images: string[];
  facilities: string[];
  rating: number;
  total_reviews: number;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface HostelData {
  id: string;
  name: string;
  description: string;
  state: string;
  price_per_month: number;
  available_rooms: number;
  images: string[];
  amenities: string[];
  rating: number;
  short_description: string;
  total_reviews: number;
  total_rooms: number;
  created_at: string;
  updated_at: string;
  location_url?: string;
  map_url?: string;
  google_maps_url?: string;
}

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [bookingMessage, setBookingMessage] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Gallery
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [hostelData, setHostelData] = useState<HostelData | null>(null);
  const { location } = useLocationContext();

  // Effect for fetching data
  useEffect(() => {
    console.log('HostelDetail useEffect triggered with id:', id);
    console.log('Current loading state:', loading);
    
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Setting loading to true');
        
        await fetchHostel();
        await fetchReviews();
        await getCurrentUser();
        
        console.log('All data fetched, setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Reference to the lightbox container
  const lightboxRef = useRef<HTMLDivElement>(null);

  // We're now using Swiper's built-in keyboard navigation
  // This effect is kept for the Escape key functionality
  useEffect(() => {
    // Only add the listener when lightbox is open
    if (!lightboxOpen) return;
    
    console.log('Setting up global keyboard listener for Escape key');
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if we have hostel data with images
      if (!hostel || !hostel.images || hostel.images.length === 0) return;
      
      console.log('Key pressed in global listener:', e.key);
      
      if (e.key === 'Escape') {
        console.log('Escape key pressed - closing lightbox');
        e.preventDefault();
        e.stopPropagation();
        setLightboxOpen(false);
      }
      // Arrow keys are now handled by Swiper's built-in keyboard navigation
    };
    
    // Add event listener with capture phase to ensure it gets events first
    window.addEventListener('keydown', handleKeyDown, true);
    
    // Cleanup function
    return () => {
      console.log('Removing global keyboard listener');
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [lightboxOpen, hostel]);
  
  // Focus management for lightbox
  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      console.log('Focusing lightbox container');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (lightboxRef.current) {
          lightboxRef.current.focus();
          console.log('Lightbox container focused');
        }
      }, 100);
    }
  }, [lightboxOpen]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchHostel = async () => {
    try {
      // No need to set loading here as it's managed in the useEffect
      setError(null);
      
      if (!id) {
        setError("No hostel ID provided");
        return;
      }
      
      // Choose schema/table based on current location
      let data: HostelData | null = null;
      let errorMessage: string | null = null;
      
      if (location && (location.includes('Bengaluru') || location.includes('Bangalore'))) {
        const { schema, table } = getHostelSourceByLocation(location);
        const sb = supabase as unknown as { schema?: (name: string) => typeof supabase };
        const client = sb.schema ? sb.schema(schema) : supabase;
        const { data: bangData, error: bangError } = await client
          .from(table as never)
          .select("*")
          .eq("id", id)
          .single();
        data = (bangData as HostelData | null);
        errorMessage = bangError ? bangError.message : null;
      } else {
        const { data: pubData, error: pubError } = await supabase
          .from("hostels")
          .select("*")
          .eq("id", id)
          .single();
        data = (pubData as HostelData | null);
        errorMessage = pubError ? pubError.message : null;
      }

      

      console.log("Fetched hostel data:", data); // Debug log to see the data

      // Process the data from Supabase
      console.log('Raw data from Supabase:', data);
      
      // Extract location information
      let locationData;
      
      // Check if there's a location URL in the data
      // Look for common location URL field names
      const hostelData = data as HostelData;
      const locationUrl = hostelData.location_url ||
                         hostelData.map_url || 
                         hostelData.google_maps_url || 
                         null;
      
      if (locationUrl && typeof locationUrl === 'string') {
        // Store as an object with url and display properties
        locationData = {
          url: locationUrl,
          display: 'View on Map'
        };
      } else {
        // Fall back to state
        locationData = {
          display: data.state || 'Location not available'
        };
      }
      
      console.log('Processed location data:', locationData);
      
      // Store the raw hostel data for directions functionality
      setHostelData(data as HostelData);
      
      setHostel({
        id: data.id,
        name: data.name,
        description: data.description,
        location: locationData, // Store as an object instead of a string
        price_range: data.price_per_month ? `₹${data.price_per_month}/month` : 'Price not available',
        available_rooms: data.available_rooms,
        images: Array.isArray(data.images) ? data.images : [],
        facilities: Array.isArray(data.amenities) ? data.amenities : [],
        rating: data.rating,
        total_reviews: data.total_reviews ?? 0,
      });
      
      // No need to set loading here as it's managed in the useEffect
    } catch (err) {
      console.error("Error in fetchHostel:", err);
      setError("An unexpected error occurred");
    }
  };

  const fetchReviews = async () => {
    console.log('fetchReviews called with id:', id);
    try {
      if (!id) {
        console.error("No hostel ID provided for reviews");
        setReviews([]);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          comment,
          rating,
          created_at,
          user_id
        `)
        .eq("hostel_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No reviews found for this hostel");
        setReviews([]);
        return;
      }

      console.log("Fetched reviews data:", data); // Debug log

      // Map the data to match the Review interface
      const formattedReviews = data.map(review => ({
        id: review.id,
        content: review.comment || "", // Map comment field to content in our interface
        rating: review.rating || 0,
        created_at: review.created_at || new Date().toISOString(),
        profiles: { full_name: "Anonymous User" } // Default name since we can't join with profiles
      }));

      setReviews(formattedReviews as Review[]);
    } catch (err) {
      console.error("Error in fetchReviews:", err);
      setReviews([]);
    }
  };



  const handleGetDirections = () => {
    if (!hostelData) {
      toast({
        title: "Location not available",
        description: "Unable to get directions for this hostel.",
        variant: "destructive",
      });
      return;
    }

    let directionsUrl = '';

    // Priority 1: Use google_maps_url if available
    if (hostelData.google_maps_url) {
      directionsUrl = hostelData.google_maps_url;
    }
    // Priority 2: Use map_url if available
    else if (hostelData.map_url) {
      directionsUrl = hostelData.map_url;
    }
    // Priority 3: Use location_url if available
    else if (hostelData.location_url) {
      directionsUrl = hostelData.location_url;
    }
    // Priority 4: Construct URL from state
    else if (hostelData.state) {
      const addressParts = [
        hostelData.state
      ].filter(Boolean);
      
      if (addressParts.length > 0) {
        const encodedAddress = encodeURIComponent(addressParts.join(', '));
        directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      }
    }

    if (directionsUrl) {
      // Ensure the URL opens Google Maps directions
      if (!directionsUrl.includes('google.com/maps') && !directionsUrl.includes('maps.google.com')) {
        // If it's not a Google Maps URL, construct a directions URL
        const encodedUrl = encodeURIComponent(directionsUrl);
        directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedUrl}`;
      }
      
      window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Location not available",
        description: "No location information available for this hostel.",
        variant: "destructive",
      });
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to make a booking",
        variant: "destructive",
      });
      return;
    }

    if (!bookingMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingBooking(true);

    try {
      // Send booking request to the database
      const { error } = await supabase.from("booking_requests").insert([
        {
          user_id: user.id,
          hostel_id: id,
          message: bookingMessage,
          status: "pending",
        },
      ]);

      if (error) {
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Start timing the operation
        const startTime = performance.now();

        // Construct WhatsApp API URL
        const whatsappUrl = `https://wa.me/9492476981?text=${encodeURIComponent(bookingMessage)}`;

        // Log the WhatsApp URL
        console.log("WhatsApp URL:", whatsappUrl);

        // Open WhatsApp URL in a new tab
        window.open(whatsappUrl, "_blank");

        // End timing the operation
        const endTime = performance.now();
        console.log(`handleBooking operation took ${endTime - startTime} milliseconds.`);

        toast({
          title: "Booking request sent",
          description: "The hostel will contact you soon via WhatsApp.",
          variant: "default",
        });
        setBookingMessage("");
      }
    } catch (err) {
      console.error("Error in handleBooking:", err);
      toast({
        title: "Unexpected error",
        description: "An error occurred while sending the booking request.",
        variant: "destructive",
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to post a comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingComment(true);
    const { error } = await supabase.from("reviews").insert([
      {
        user_id: user.id,
        hostel_id: id,
        comment: newComment,
        rating: 5, // Default rating for comments
      },
    ]);

    if (error) {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
        variant: "default",
      });
      setNewComment("");
      // Refresh comments
      await fetchReviews();
    }

    setSubmittingComment(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="flex items-center justify-center h-screen">
        Hostel not found
      </div>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => navigate(-1)}
            className="mt-4"
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/hostels")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hostels
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <Card className="card-elegant overflow-hidden">
              <div className="w-full max-w-4xl mx-auto relative">
                {hostel.images && hostel.images.length > 0 ? (
                  <>
                    <Swiper
                      modules={[Navigation, Pagination, Thumbs]}
                      navigation
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      thumbs={{ swiper: thumbsSwiper }}
                      className="mb-4 h-64 sm:h-80 rounded-2xl overflow-hidden"
                    >
                      {hostel.images.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={img}
                            alt={`${hostel.name} - image ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setLightboxIndex(index);
                              setLightboxOpen(true);
                            }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <Swiper
                      modules={[Thumbs]}
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      className="cursor-pointer"
                    >
                      {hostel.images.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-300 hover:border-red-500 transition"
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64 sm:h-80 text-6xl opacity-30">
                    🏠
                  </div>
                )}

                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="secondary" className="bg-white/90 text-primary font-semibold">
                    {hostel.available_rooms} rooms available
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Hostel Info */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">{hostel.name}</CardTitle>
                <CardDescription>
                  {hostel.location && typeof hostel.location === 'object' ? (
                    hostel.location.url ? (
                      <a 
                        href={hostel.location.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Location link clicked');
                        }}
                      >
                        {hostel.location.display}
                      </a>
                    ) : (
                      hostel.location.display
                    )
                  ) : (
                    'Location not available'
                  )}
                </CardDescription>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGetDirections}
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 hover:border-yellow-500"
                  >
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{hostel.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {hostel.rating.toFixed(1)} ({hostel.total_reviews} reviews)
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {hostel.available_rooms} rooms available
                  </Badge>
                </div>
                {/* Price Display */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Price</h3>
                  <p className="text-xl font-bold text-primary">{hostel.price_range}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hostel.facilities?.map((facility, index) => (
                    <Badge key={index} variant="outline">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="card-elegant mt-6">
              <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>
                  Share your thoughts about this hostel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment Form - Only show if user is logged in */}
                {user ? (
                  <div className="space-y-4 border-b pb-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                      rows={3}
                    />
                    <Button
                      onClick={handleCommentSubmit}
                      disabled={submittingComment || !newComment.trim()}
                      size="sm"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 border-b">
                    <p className="text-muted-foreground mb-2">Please login to post a comment</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/auth")}
                    >
                      Login
                    </Button>
                  </div>
                )}

                {/* Comments Display */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {review.profiles.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{review.profiles.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {review.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{review.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 ml-10">{review.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className="card-elegant mt-6">
              <CardHeader>
                <CardTitle>Book This Hostel</CardTitle>
                <CardDescription>
                  Send a booking request to the hostel. You can include a message if needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Write a message for your booking..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
                  rows={4}
                />

                <Button
                  onClick={handleBooking}
                  disabled={submittingBooking || !bookingMessage.trim()}
                >
                  {submittingBooking ? "Sending..." : "Send Booking Request"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Lightbox Viewer */}
      {lightboxOpen && hostel && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          tabIndex={0} // Make div focusable for keyboard events
          autoFocus // Try to focus automatically
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            className="absolute top-4 right-4 text-white pointer-events-auto z-50"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Swiper Fullscreen */}
          <Swiper
            modules={[Navigation, Pagination, Keyboard]}
            navigation
            pagination={{ clickable: true }}
            initialSlide={lightboxIndex}
            className="w-full h-full"
            onSwiper={(swiper) => {
              console.log('Lightbox swiper initialized');
              // Focus the container after swiper is initialized
              if (lightboxRef.current) {
                lightboxRef.current.focus();
                console.log('Focused lightbox after swiper init');
              }
            }}
            keyboard={{ enabled: true, onlyInViewport: false }} // Enable Swiper's keyboard handling
          >
            {hostel && hostel.images && hostel.images.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Fullscreen ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default HostelDetail;
