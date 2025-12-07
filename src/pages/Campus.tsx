import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Book, Coffee, Wifi, Car, Shield } from 'lucide-react';

const Campus = () => {
  const facilities = [
    { name: 'Library', icon: Book, description: '24/7 access with study areas' },
    { name: 'WiFi Zones', icon: Wifi, description: 'High-speed internet across campus' },
    { name: 'Cafeteria', icon: Coffee, description: 'Multiple dining options available' },
    { name: 'Parking', icon: Car, description: 'Secure parking for students' },
    { name: 'Security', icon: Shield, description: '24/7 campus security' },
    { name: 'Location', icon: MapPin, description: 'Centrally located campus' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Campus Overview</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our beautiful campus with modern facilities and convenient amenities for student life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => {
            const Icon = facility.icon;
            return (
              <Card key={facility.name} className="card-elegant hover-lift">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{facility.name}</CardTitle>
                  <CardDescription>{facility.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Campus;