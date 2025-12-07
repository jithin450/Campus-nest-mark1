"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/keyboard";

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

interface RestaurantCarouselProps {
  restaurants: Restaurant[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({
  restaurants,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen && !lightboxOpen) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          if (lightboxOpen) {
            setLightboxOpen(false);
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    if (isOpen || lightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Focus the carousel container for accessibility
      setTimeout(() => {
        if (lightboxOpen && lightboxRef.current) {
          lightboxRef.current.focus();
        } else if (carouselRef.current) {
          carouselRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, lightboxOpen, onClose]);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen || restaurants.length === 0) {
    return null;
  }

  const currentRestaurant = restaurants[currentIndex];

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          ref={carouselRef}
          className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
          role="dialog"
          aria-label="Restaurant carousel"
          aria-modal="true"
        >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
          onClick={onClose}
          aria-label="Close carousel"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous restaurant"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
          onClick={() => swiperRef.current?.slideNext()}
          aria-label="Next restaurant"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Main carousel */}
        <div className="h-96">
          <Swiper
            modules={[Navigation, Pagination, Thumbs, Keyboard]}
            navigation={true}
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            initialSlide={currentIndex}
            thumbs={{ swiper: thumbsSwiper }}
            keyboard={{ enabled: true, onlyInViewport: false }}
            loop={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // Focus swiper container for keyboard navigation
              setTimeout(() => {
                if (swiper.el) {
                  swiper.el.focus();
                }
              }, 100);
            }}
            onSlideChange={(swiper) => {
              setCurrentIndex(swiper.realIndex);
            }}
            className="h-full"
          >
            {restaurants.map((restaurant, index) => (
              <SwiperSlide key={restaurant.id}>
                <div className="h-full flex">
                  {/* Image section */}
                  <div className="w-1/2 h-full relative">
                    {restaurant.images && restaurant.images.length > 0 && restaurant.images[0] !== "/placeholder.svg" ? (
                      <div className="relative w-full h-full group cursor-pointer">
                        <img
                          src={restaurant.images[0]}
                          alt={`${restaurant.name} - main image`}
                          className="w-full h-full object-cover"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Main image clicked directly, opening lightbox for restaurant:', restaurant.name);
                            setLightboxIndex(0);
                            setLightboxOpen(true);
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-6xl opacity-60">
                                🍽️
                              </div>
                            `;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 text-sm font-medium shadow-lg">
                            🔍 View Images
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-6xl opacity-60">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Content section */}
                  <div className="w-1/2 p-6 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {restaurant.name}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{restaurant.address}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{restaurant.rating}</span>
                          </div>
                          <Badge variant="secondary">{restaurant.cuisine}</Badge>
                          <Badge variant="outline">₹{restaurant.average_price}</Badge>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {restaurant.description}
                      </p>

                      {restaurant.amenities && restaurant.amenities.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-1">
                            {restaurant.amenities.slice(0, 6).map((amenity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                            {restaurant.amenities.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{restaurant.amenities.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Thumbnail navigation */}
        {restaurants.length > 1 && (
          <div className="p-4 bg-gray-50">
            <Swiper
              modules={[Thumbs]}
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={Math.min(restaurants.length, 5)}
              className="cursor-pointer"
              watchSlidesProgress
            >
              {restaurants.map((restaurant, index) => (
                <SwiperSlide key={restaurant.id}>
                  <div
                    className={`p-2 rounded-lg border-2 transition-all ${
                      index === currentIndex
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-900 truncate">
                        {restaurant.name}
                      </div>
                      <div className="text-xs text-gray-600">{restaurant.cuisine}</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Accessibility instructions */}
        <div className="sr-only" aria-live="polite">
          Showing restaurant {currentIndex + 1} of {restaurants.length}. Use left and right arrow keys to navigate, or press Escape to close.
        </div>
        </div>
      </div>

      {/* Lightbox for fullscreen image viewing - moved outside main carousel */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => {
            console.log('Lightbox background clicked, closing lightbox');
            setLightboxOpen(false);
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="h-6 w-6" />
            </Button>

            {restaurants[currentIndex] && restaurants[currentIndex].images && restaurants[currentIndex].images.length > 0 ? (
              <div style={{ width: '90%', height: '90%' }}>
                <Swiper
                  modules={[Navigation, Pagination, Keyboard]}
                  navigation={true}
                  pagination={{ clickable: true }}
                  initialSlide={lightboxIndex}
                  style={{ width: '100%', height: '100%' }}
                  onSwiper={(swiper) => {
                    console.log('Lightbox swiper initialized with', restaurants[currentIndex].images.filter(img => img && img !== '/placeholder.svg').length, 'images');
                  }}
                  keyboard={{ 
                    enabled: true, 
                    onlyInViewport: false
                  }}
                  loop={restaurants[currentIndex].images.filter(img => img && img !== '/placeholder.svg').length > 1}
                >
                  {restaurants[currentIndex].images.filter(img => img && img !== '/placeholder.svg').map((img, index) => (
                    <SwiperSlide key={index}>
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={img}
                          alt={`${restaurants[currentIndex].name} - image ${index + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            console.log('Image failed to load:', img);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div style={{ color: 'white', textAlign: 'center', fontSize: '1.25rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
                <div>No images available</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantCarousel;
