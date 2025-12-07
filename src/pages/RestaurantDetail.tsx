import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, Phone, Utensils, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/context/LocationContext';
 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/keyboard';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  short_description: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  cuisine_type: string;
  price_range: string;
  rating: number;
  total_reviews: number;
  opening_hours: string;
  contact_number: string;
}

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const { location } = useLocationContext();

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      let data: Restaurant | null = null;
      let errorMessage: string | null = null;

      const { data: pubData, error: pubError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      data = pubData as Restaurant | null;
      errorMessage = pubError ? pubError.message : null;

      

      if (errorMessage && !data) {
        console.warn('Restaurant fetch error:', errorMessage);
      }
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    if (restaurant?.images) {
      setLightboxIndex((prev) => 
        prev === restaurant.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevLightboxImage = () => {
    if (restaurant?.images) {
      setLightboxIndex((prev) => 
        prev === 0 ? restaurant.images.length - 1 : prev - 1
      );
    }
  };

  const handleGetDirections = () => {
    if (restaurant) {
      // Build Google Maps URL using address, city, and state
      const destination = encodeURIComponent(`${restaurant.address}, ${restaurant.city}, ${restaurant.state}`);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Restaurant Not Found</h2>
            <p className="text-muted-foreground mb-6">The restaurant you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/restaurants')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Restaurants
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/restaurants')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Restaurants
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {restaurant.images && restaurant.images.length > 0 && (
              <>
                {/* Main Carousel */}
                <div className="aspect-video overflow-hidden rounded-lg">
                  <Swiper
                    modules={[Navigation, Pagination, Thumbs, Keyboard]}
                    navigation
                    pagination={{ clickable: true }}
                    keyboard={{ enabled: true, onlyInViewport: false }}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    className="h-full w-full"
                    onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                  >
                    {restaurant.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image || '/placeholder.svg'}
                          alt={`${restaurant.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openLightbox(index)}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Thumbnail Navigation */}
                {restaurant.images.length > 1 && (
                  <div className="h-20">
                    <Swiper
                      modules={[Navigation, Thumbs]}
                      onSwiper={setThumbsSwiper}
                      spaceBetween={10}
                      slidesPerView={4}
                      freeMode={true}
                      watchSlidesProgress={true}
                      className="h-full"
                    >
                      {restaurant.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={image || '/placeholder.svg'}
                            alt={`${restaurant.name} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover rounded cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            onClick={() => openLightbox(index)}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Restaurant Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">{restaurant.rating}</span>
                  <span className="text-sm text-muted-foreground">({restaurant.total_reviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Utensils className="h-3 w-3" />
                  {restaurant.cuisine_type}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {restaurant.price_range}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {restaurant.description}
              </p>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{restaurant.address}, {restaurant.city}, {restaurant.state}</span>
                </div>
                
                {restaurant.opening_hours && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                )}
                
                {restaurant.contact_number && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{restaurant.contact_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {restaurant.contact_number && (
                <Button className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Restaurant
                </Button>
              )}
              <Button variant="outline" className="flex-1" onClick={handleGetDirections}>
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && restaurant?.images && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                zIndex: 10001
              }}
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {restaurant.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevLightboxImage();
                  }}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '24px',
                    zIndex: 10001
                  }}
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextLightboxImage();
                  }}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '24px',
                    zIndex: 10001
                  }}
                >
                  →
                </button>
              </>
            )}

            {/* Lightbox Content */}
            <div
              style={{
                width: '90%',
                height: '90%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Swiper
                 modules={[Navigation, Pagination, Keyboard]}
                 navigation
                 pagination={{ clickable: true }}
                 keyboard={{ enabled: true, onlyInViewport: false }}
                 initialSlide={lightboxIndex}
                 onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
                 style={{ width: '100%', height: '100%' }}
               >
                {restaurant.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img
                        src={image || '/placeholder.svg'}
                        alt={`${restaurant.name} - Image ${index + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Image Counter */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                zIndex: 10001
              }}
            >
              {lightboxIndex + 1} / {restaurant.images.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDetail;
