import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Loader2, Settings, Map, Grid, Gift } from 'lucide-react';
import { getDiscoverProfiles, getUserProfile } from '@/lib/profiles';
import { upsertLike } from '@/lib/likes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/supabase';
import { calculateDistance } from '@/hooks/useGeolocation';
import MapView from '@/components/discover/MapView';
import { SendGiftModal } from '@/components/SendGiftModal';

const Discover = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);
    const { profiles: data, error } = await getDiscoverProfiles(user.id);

    if (error) {
      toast({
        title: 'Error loading profiles',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProfiles(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { profile } = await getUserProfile(user.id);
        setUserProfile(profile);
        loadProfiles();
        if (profile) {
          const demo = profile.demographics as any;
          if (demo?.location_lat && demo?.location_lng) {
            setUserLocation({
              lat: Number(demo.location_lat),
              lng: Number(demo.location_lng),
            });
          }
        }
      }
    };
    fetchUserProfile();
  }, [user, authLoading]);

  const handleLike = async () => {
    if (!user) return;
    const target = profiles[currentIndex];
    if (!target) return;

    // Optimistic UI
    nextProfile();

    const { error } = await upsertLike(user.id, target.id, "like");
    if (error) {
      toast({
        title: 'Like failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '❤️ Liked!',
      description: "If they like you back, it's a match!",
    });
  };

  const handlePass = async () => {
    if (!user) return;
    const target = profiles[currentIndex];
    if (!target) return;

    // Optimistic next
    nextProfile();

    const { error } = await upsertLike(user.id, target.id, "pass");
    if (error) {
      toast({
        title: 'Could not pass',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: 'No more profiles',
        description: 'Check back later for more matches!',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:ml-20">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold text-primary">No profiles yet</h2>
          <p className="text-muted-foreground">Check back soon for new matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:ml-20">
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-r from-background to-card p-4 md:px-8 md:py-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Discover</h1>
            <p className="text-sm text-muted-foreground mt-1">{profiles.length} of {profiles.length} profiles</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('cards')}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? (
        <div className="flex-1 p-4 md:p-8">
          <div className="h-[calc(100vh-200px)] w-full">
            <MapView
              profiles={profiles}
              userLocation={userLocation}
              onLike={handleLike}
              onPass={handlePass}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md">
            <Card className="shadow-card-hover overflow-hidden animate-scale-in border-0">
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                {currentProfile.photos?.[0] ? (
                  <img
                    src={currentProfile.photos[0]}
                    alt={currentProfile.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-hero">
                    <Heart className="h-24 w-24 text-white/50" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white">
                  <h2 className="mb-2 text-3xl font-bold">
                    {currentProfile.display_name}
                  </h2>
                  {(currentProfile.demographics as any)?.location_lat && (currentProfile.demographics as any)?.location_lng && userLocation && (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          Number((currentProfile.demographics as any).location_lat),
                          Number((currentProfile.demographics as any).location_lng)
                        )} miles away
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-6 bg-card">
                {currentProfile.bio && (
                  <p className="mb-4 text-foreground text-sm">{currentProfile.bio}</p>
                )}

                {currentProfile.tags && currentProfile.tags.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {currentProfile.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-secondary/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border border-muted-foreground/30 hover:bg-muted/50"
                    onClick={handlePass}
                  >
                    <X className="mr-2 h-5 w-5" />
                    Pass
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 gradient-primary hover:shadow-lg text-white font-semibold"
                    onClick={handleLike}
                  >
                    <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                    Like
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full mt-4 text-accent hover:text-accent/80 hover:bg-accent/10 font-medium"
                  onClick={() => setIsGiftModalOpen(true)}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Send Gift
                </Button>
              </CardContent>
            </Card>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {currentIndex + 1} of {profiles.length} profiles
            </p>
          </div>
        </div>
      )}

      {currentProfile && (
        <SendGiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          receiverEmail={currentProfile.email}
          receiverName={currentProfile.display_name}
        />
      )}
    </div>
  );
};

export default Discover;
