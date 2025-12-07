import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Clock, Phone, Camera, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/context/LocationContext';
 
import { useToast } from '@/hooks/use-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/keyboard';

interface PlaceToVisit {
  id: string;
  name: string;
  description: string;
  short_description: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  category: string;
  entry_fee: string;
  opening_hours: string;
  rating: number;
  total_reviews: number;
  contact_number: string;
}

interface PlaceData {
  id: string;
  name: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  images: string[];
  category: string;
  entry_fee?: string;
  opening_hours?: string;
  rating: number;
  total_reviews?: number;
  contact_number?: string;
  maps_url?: string;
  location_url?: string;
  google_maps_url?: string;
}

const PlacesToVisitDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [place, setPlace] = useState<PlaceToVisit | null>(null);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const { location } = useLocationContext();

  useEffect(() => {
    if (id) {
      fetchPlace();
    }
  }, [id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!place || !place.images || place.images.length === 0) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevLightboxImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextLightboxImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [lightboxOpen, place]);

  const fetchPlace = async () => {
    try {
      let data: PlaceData | null = null;
      let errorMessage: string | null = null;

      const { data: pubData, error: pubError } = await supabase
        .from('places_to_visit')
        .select('*')
        .eq('id', id)
        .single();
      data = pubData as PlaceData | null;
      errorMessage = pubError ? pubError.message : null;

      

      if (errorMessage && !data) {
        console.warn('Place fetch error:', errorMessage);
      }
      
      const rawImages = (data as unknown as { images?: unknown }).images;
      let normalizedImages: string[] = [];
      if (Array.isArray(rawImages)) {
        normalizedImages = (rawImages as string[]).filter(Boolean);
      } else if (typeof rawImages === 'string') {
        try {
          const parsed = JSON.parse(rawImages);
          if (Array.isArray(parsed)) {
            normalizedImages = parsed.filter(Boolean);
          } else if (rawImages.trim()) {
            normalizedImages = [rawImages];
          }
        } catch (e) {
          void e;
          if (rawImages.trim()) {
            normalizedImages = [rawImages];
          }
        }
      }
      const placeWithImages: PlaceData = {
        ...(data as PlaceData),
        images: normalizedImages
      };
      setPlaceData(placeWithImages);
      setPlace(placeWithImages as unknown as PlaceToVisit);
    } catch (error) {
      console.error('Error fetching place:', error);
      toast({
        title: "Error",
        description: "Failed to load place details.",
        variant: "destructive",
      });
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
    if (place?.images) {
      setLightboxIndex((prev) => 
        prev === place.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevLightboxImage = () => {
    if (place?.images) {
      setLightboxIndex((prev) => 
        prev === 0 ? place.images.length - 1 : prev - 1
      );
    }
  };

  const handleGetDirections = () => {
    if (!placeData) {
      toast({
        title: "Location not available",
        description: "Unable to get directions for this place.",
        variant: "destructive",
      });
      return;
    }

    let directionsUrl = '';

    // Priority 1: Use google_maps_url if available
    if (placeData.google_maps_url) {
      directionsUrl = placeData.google_maps_url;
    }
    // Priority 2: Use maps_url if available
    else if (placeData.maps_url) {
      directionsUrl = placeData.maps_url;
    }
    // Priority 3: Use location_url if available
    else if (placeData.location_url) {
      directionsUrl = placeData.location_url;
    }
    // Priority 4: Construct URL from address/city/state
    else if (placeData.address || placeData.city || placeData.state) {
      const addressParts = [
        placeData.address,
        placeData.city,
        placeData.state
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
        description: "No location information available for this place.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Place Not Found</h2>
            <p className="text-muted-foreground mb-6">The place you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/places')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Places
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
          onClick={() => navigate('/places')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Places
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {place.images && place.images.length > 0 && (
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
                    {place.images.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image || '/placeholder.svg'}
                          alt={`${place.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openLightbox(index)}
                          onError={(e) => {
                            console.log('Image failed to load:', image);
                            // If it's a Supabase storage URL that failed, try a fallback image
                            if (image && image.includes('supabase.co/storage')) {
                              const fallbackImages = [
                                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                                'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
                                'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400',
                                'https://images.unsplash.com/photo-1539650116574-75c0c6d73d1e?w=400'
                              ];
                              const fallbackIndex = index % fallbackImages.length;
                              e.currentTarget.src = fallbackImages[fallbackIndex];
                            } else {
                              e.currentTarget.src = '/placeholder.svg';
                            }
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Thumbnail Navigation */}
                {place.images.length > 1 && (
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
                      {place.images.map((image, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={image || '/placeholder.svg'}
                            alt={`${place.name} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover rounded cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                            onClick={() => openLightbox(index)}
                            onError={(e) => {
                               // If it's a Supabase storage URL that failed, try a fallback image
                               if (image && image.includes('supabase.co/storage')) {
                                 const fallbackImages = [
                                   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                                   'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
                                   'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400',
                                   'https://images.unsplash.com/photo-1539650116574-75c0c6d73d1e?w=400'
                                 ];
                                 const fallbackIndex = index % fallbackImages.length;
                                 e.currentTarget.src = fallbackImages[fallbackIndex];
                               } else {
                                 e.currentTarget.src = '/placeholder.svg';
                               }
                             }}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Place Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold">{place.name}</h1>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-medium">{place.rating}</span>
                  <span className="text-sm text-muted-foreground">({place.total_reviews} reviews)</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  {place.category}
                </Badge>
                {place.entry_fee && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {place.entry_fee}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed">
                {place.description}
              </p>
            </div>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>{place.address}, {place.city}, {place.state}</span>
                </div>
                
                {place.opening_hours && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{place.opening_hours}</span>
                  </div>
                )}
                
                {place.contact_number && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{place.contact_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Get Directions Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleGetDirections}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-400 hover:border-yellow-500"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && place?.images && (
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
            {place.images.length > 1 && (
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
                {place.images.map((image, index) => (
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
                        alt={`${place.name} - Image ${index + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          // If it's a Supabase storage URL that failed, try a fallback image
                          if (image && image.includes('supabase.co/storage')) {
                            const fallbackImages = [
                              'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
                              'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
                              'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=400',
                              'https://images.unsplash.com/photo-1539650116574-75c0c6d73d1e?w=400'
                            ];
                            const fallbackIndex = index % fallbackImages.length;
                            e.currentTarget.src = fallbackImages[fallbackIndex];
                          } else {
                            e.currentTarget.src = '/placeholder.svg';
                          }
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlacesToVisitDetails;
