import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, Loader2, Settings, Map, Grid, Gift, MessageCircle } from "lucide-react";
import { getDiscoverProfiles, getUserProfile } from '@/lib/profiles';
import { upsertLike } from '@/lib/likes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/lib/supabase';
import { calculateDistance } from '@/hooks/useGeolocation';
import MapView from '@/components/discover/MapView';
import { SendGiftModal } from '@/components/SendGiftModal';
import { DiscoverySettings } from '@/components/discover/DiscoverySettings';

const Discover = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [discoveryPrefs, setDiscoveryPrefs] = useState<any>(null);

  const loadProfiles = async () => {
    if (!user) return;

    setLoading(true);
    const { profiles: data, error }: any = await getDiscoverProfiles(user.id);

    if (error) {
      toast({
        title: 'Error loading profiles',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProfiles(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { profile } = await getUserProfile(user.id);
        loadProfiles();
        if (profile) {
          setDiscoveryPrefs(profile.discovery_preferences);
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

  const handleLike = async (profile?: any) => {
    if (!user) return;
    const target = profile || profiles[currentIndex];
    if (!target) return;

    if (!profile) nextProfile();

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
      description: `You liked ${target.display_name}!`,
    });
  };

  const handlePass = async (profile?: any) => {
    if (!user) return;
    const target = profile || profiles[currentIndex];
    if (!target) return;

    if (!profile) nextProfile();

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
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsSettingsOpen(true)}
            >
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
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles
                .filter(profile => {
                  if (!discoveryPrefs?.radius || !userLocation) return true;
                  const dist = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    Number((profile.demographics as any)?.location_lat),
                    Number((profile.demographics as any)?.location_lng)
                  );
                  return dist <= discoveryPrefs.radius;
                })
                .map((profile, index) => (
                  <Card key={profile.id} className="shadow-card-hover overflow-hidden animate-scale-in border-0">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                      {profile.photos?.[0] ? (
                        <img
                          src={profile.photos[0]}
                          alt={profile.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-hero">
                          <Heart className="h-24 w-24 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 text-white">
                        <h2 className="mb-2 text-2xl font-bold">
                          {profile.display_name}
                        </h2>
                        {(profile.demographics as any)?.location_lat && (profile.demographics as any)?.location_lng && userLocation && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                Number((profile.demographics as any).location_lat),
                                Number((profile.demographics as any).location_lng)
                              )} miles away
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6 bg-card">
                      {profile.bio && (
                        <p className="mb-4 text-foreground text-sm line-clamp-3">{profile.bio}</p>
                      )}

                      {profile.tags && profile.tags.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {profile.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-secondary/60">
                              {tag}
                            </Badge>
                          ))}
                          {profile.tags.length > 3 && (
                            <Badge variant="secondary" className="bg-secondary/60">
                              +{profile.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-12 w-12 border-muted-foreground/30"
                            onClick={() => handlePass(profile)}
                          >
                            <X className="h-6 w-6 text-muted-foreground" />
                          </Button>
                          <Button
                            size="lg"
                            className="flex-1 gradient-primary hover:shadow-lg text-white font-semibold h-12"
                            onClick={() => handleLike(profile)}
                          >
                            <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                            Like
                          </Button>
                        </div>

                        <Button
                          size="lg"
                          variant="secondary"
                          className="w-full flex items-center justify-center gap-2 font-bold h-12 border-primary/20 hover:bg-primary/5 transition-colors"
                          onClick={() => {
                            navigate("/messages", { state: { partnerId: profile.id } });
                          }}
                        >
                          <MessageCircle className="h-5 w-5 text-primary" />
                          Message Now
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        className="w-full mt-4 text-accent hover:text-accent/80 hover:bg-accent/10 font-medium"
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsGiftModalOpen(true);
                        }}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Send Gift
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {profiles.length === 0 && (
              <div className="text-center py-12">
                <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-2xl font-bold text-primary">No profiles yet</h2>
                <p className="text-muted-foreground">Check back soon for new matches!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {profiles[currentIndex] && (
        <SendGiftModal
          isOpen={isGiftModalOpen}
          onClose={() => setIsGiftModalOpen(false)}
          receiverEmail={profiles[currentIndex].email}
          receiverName={profiles[currentIndex].display_name}
        />
      )}

      <DiscoverySettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => loadProfiles()}
      />
    </div>
  );
};

export default Discover;
