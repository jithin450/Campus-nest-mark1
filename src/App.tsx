import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LocationProvider } from "@/context/LocationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Hostels from "./pages/Hostels";
import HostelDetail from "./pages/HostelDetail";
import Campus from "./pages/Campus";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantCarouselDemo from "./pages/RestaurantCarouselDemo";
import PlacesToVisit from "./pages/PlacesToVisit";
import PlacesToVisitDetails from "./pages/PlacesToVisitDetails";
import SocialMedia from "./pages/SocialMedia";
import NotFound from "./pages/NotFound";
import Setup from "./pages/Setup";
import Profile from "./pages/Profile";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/hostels/:id" element={<HostelDetail />} />
            <Route path="/campus" element={<Campus />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/restaurant-carousel" element={<RestaurantCarouselDemo />} />
            <Route path="/places" element={<PlacesToVisit />} />
           <Route path="/places/:id" element={<PlacesToVisitDetails />} />
            <Route path="/social" element={<SocialMedia />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/profile" element={<Profile />} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </LocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
