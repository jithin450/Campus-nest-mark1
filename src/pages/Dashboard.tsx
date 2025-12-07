import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Star, MapPin, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      setLoading(false);
    }
  }, [navigate, user, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Browse Hostels',
      description: 'Discover amazing hostels near campus with verified reviews and ratings.',
      icon: Building,
      href: '/hostels',
      color: 'from-red-500 to-red-600',
      stats: '50+ Properties'
    },
    {
      title: 'Restaurants',
      description: 'Explore local restaurants and dining options near campus.',
      icon: Star,
      href: '/restaurants',
      color: 'from-yellow-500 to-orange-500',
      stats: '25+ Restaurants'
    },
    {
      title: 'Places to Visit',
      description: 'Discover amazing places to visit and explore around the city.',
      icon: MapPin,
      href: '/places',
      color: 'from-green-500 to-emerald-600',
      stats: 'Tourist Spots'
    },
    {
      title: 'Community',
      description: 'Connect with fellow students through WhatsApp groups and social media.',
      icon: Users,
      href: '/social',
      color: 'from-blue-500 to-purple-600',
      stats: 'Join Groups'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Campus Nest{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your complete student life companion. Find hostels, discover restaurants, explore places, and connect with your campus community.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate('/hostels')}>
            Start Exploring
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={card.title} 
                className="card-elegant hover-lift cursor-pointer group"
                onClick={() => navigate(card.href)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{card.stats}</span>
                    <Button variant="ghost" size="sm">
                      Explore →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Verified Hostels</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">25+</div>
            <div className="text-sm text-muted-foreground">Local Restaurants</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-primary mb-2">95%</div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </Card>
          <Card className="text-center p-6">
            <div className="text-2xl font-bold text-accent mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Places to Visit</div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;