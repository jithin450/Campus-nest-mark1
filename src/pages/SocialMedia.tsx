import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { MessageCircle, Instagram, Facebook, Users, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import { fetchCards, CardRecord } from '@/utils/cardsApi';

interface SocialGroup {
  id: string;
  name: string;
  description: string;
  platform: 'whatsapp' | 'instagram' | 'facebook';
  link: string;
  members: number;
  category: string;
}

const SocialMedia = () => {
  const { location } = useLocationContext();
  const [groups, setGroups] = useState<CardRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    if (!location) {
      setGroups([]);
      setLoading(false);
      return () => { active = false; };
    }
    fetchCards('community', location)
      .then((cards) => {
        if (!active) return;
        setGroups(cards);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [location]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      case 'facebook':
        return <Facebook className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return 'text-green-600';
      case 'instagram':
        return 'text-pink-600';
      case 'facebook':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

  const handleJoinGroup = (link: string) => {
    window.open(link, '_blank');
  };

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">Please select the Location</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Local Social Media
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with your campus community through WhatsApp groups, Instagram pages, and Facebook communities
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id} className="card-elegant hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-background`}>
                      {getPlatformIcon((group.meta?.platform || 'users') as string)}
                    </div>
                    <span className="text-sm text-muted-foreground capitalize">{group.meta?.category || 'Community'}</span>
                  </div>
                  <CardTitle className="text-lg">{group.title}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{group.meta?.members || 0} members</span>
                    <span className="capitalize">{group.meta?.platform || 'community'}</span>
                  </div>
                  
                  <Button 
                    className="w-full"
                    variant="hero"
                    onClick={() => handleJoinGroup(group.meta?.link || '')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="card-elegant max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-gradient">Want to add your group?</CardTitle>
                <CardDescription>
                  Have a student group, club, or community page? Let us know and we'll add it to the list!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
