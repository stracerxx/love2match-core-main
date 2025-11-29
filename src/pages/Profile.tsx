import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Heart, Loader2, Edit2, Save, LogOut, Share2,
  Camera, Video, Gift, Crown, Star, Users,
  MapPin, Calendar, Settings, Wallet, Bell,
  Shield, Zap, TrendingUp, Award, Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/lib/profiles';
import { signOut } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile } from '@/lib/supabase';
import { useGeolocation } from '@/hooks/useGeolocation';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { location: geoLocation, loading: geoLoading } = useGeolocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    full_name: '',
    bio: '',
    location: '',
    location_lat: null as number | null,
    location_lng: null as number | null,
    interests: '',
    relationship_goals: '',
    height: '',
    occupation: '',
    education: '',
    languages: '',
    zodiac_sign: '',
    drinking_habits: '',
    smoking_habits: '',
    exercise_habits: '',
    religion: '',
    political_views: '',
    has_pets: false,
    wants_children: '',
    personality_type: '',
    love_language: '',
    dealbreakers: '',
    ideal_date: '',
    social_media_links: '',
    discovery_radius: '50',
    age_range_min: '18',
    age_range_max: '99',
    show_me: 'everyone',
    notification_enabled: true,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    privacy_profile_visible: true,
    privacy_show_online_status: true,
    privacy_allow_messaging: true,
    privacy_show_location: false,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { profile: data, error } = await getUserProfile(user.id);
    
    if (error) {
      // Profile doesn't exist, that's okay - we'll just create an empty one
      // This can happen if they logged in with an existing account
      const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
      const fullName = user.user_metadata?.full_name || displayName;
      
      setFormData({
        display_name: displayName,
        full_name: fullName,
        bio: '',
        location: '',
        location_lat: null,
        location_lng: null,
        interests: '',
        relationship_goals: '',
        height: '',
        occupation: '',
        education: '',
        languages: '',
        zodiac_sign: '',
        drinking_habits: '',
        smoking_habits: '',
        exercise_habits: '',
        religion: '',
        political_views: '',
        has_pets: false,
        wants_children: '',
        personality_type: '',
        love_language: '',
        dealbreakers: '',
        ideal_date: '',
        social_media_links: '',
        discovery_radius: '50',
        age_range_min: '18',
        age_range_max: '99',
        show_me: 'everyone',
        notification_enabled: true,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        privacy_profile_visible: true,
        privacy_show_online_status: true,
        privacy_allow_messaging: true,
        privacy_show_location: false,
      });
      
      // Create a minimal profile object for display
      setProfile({
        id: user.id,
        email: user.email || '',
        display_name: displayName,
        full_name: fullName,
        age_verified: false,
        role: 'member',
        account_type: 'standard',
        is_suspended: false,
        membership_tier: 'free',
        membership_expires_at: null,
        daily_likes_remaining: 20,
        balances: {},
        verification_count: 0,
        photos: [],
        profile_videos: [],
        bio: '',
        demographics: {},
        tags: [],
        discovery_preferences: {},
        is_online: false,
        referral_code: '',
        created_date: new Date().toISOString(),
        last_active: new Date().toISOString(),
      });
    } else if (data) {
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: data.demographics?.location || '',
        location_lat: data.demographics?.location_lat || null,
        location_lng: data.demographics?.location_lng || null,
        interests: data.demographics?.interests?.join(', ') || '',
        relationship_goals: data.demographics?.relationship_goals || '',
        height: data.demographics?.height || '',
        occupation: data.demographics?.occupation || '',
        education: data.demographics?.education || '',
        languages: data.demographics?.languages?.join(', ') || '',
        zodiac_sign: data.demographics?.zodiac_sign || '',
        drinking_habits: data.demographics?.drinking_habits || '',
        smoking_habits: data.demographics?.smoking_habits || '',
        exercise_habits: data.demographics?.exercise_habits || '',
        religion: data.demographics?.religion || '',
        political_views: data.demographics?.political_views || '',
        has_pets: data.demographics?.has_pets || false,
        wants_children: data.demographics?.wants_children || '',
        personality_type: data.demographics?.personality_type || '',
        love_language: data.demographics?.love_language || '',
        dealbreakers: data.demographics?.dealbreakers || '',
        ideal_date: data.demographics?.ideal_date || '',
        social_media_links: data.demographics?.social_media_links?.join(', ') || '',
        discovery_radius: data.discovery_preferences?.radius?.toString() || '50',
        age_range_min: data.discovery_preferences?.age_range?.min?.toString() || '18',
        age_range_max: data.discovery_preferences?.age_range?.max?.toString() || '99',
        show_me: data.discovery_preferences?.show_me || 'everyone',
        notification_enabled: data.notification_preferences?.enabled || true,
        email_notifications: data.notification_preferences?.email || true,
        push_notifications: data.notification_preferences?.push || true,
        sms_notifications: data.notification_preferences?.sms || false,
        privacy_profile_visible: data.privacy_settings?.profile_visible || true,
        privacy_show_online_status: data.privacy_settings?.show_online_status || true,
        privacy_allow_messaging: data.privacy_settings?.allow_messaging || true,
        privacy_show_location: data.privacy_settings?.show_location || false,
      });
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { profile: updated, error } = await updateUserProfile(user.id, formData);
    
    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProfile(updated);
      setEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    }

    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleUpdateLocation = async () => {
    if (!geoLocation || !user) return;

    const locationString = geoLocation.city
      ? `${geoLocation.city}, ${geoLocation.country}`
      : `${geoLocation.latitude.toFixed(2)}, ${geoLocation.longitude.toFixed(2)}`;

    setFormData({
      ...formData,
      location: locationString,
      location_lat: geoLocation.latitude,
      location_lng: geoLocation.longitude,
    });

    const { error } = await supabase
      .from('users')
      .update({
        demographics: {
          ...profile?.demographics,
          location: locationString,
          location_lat: geoLocation.latitude,
          location_lng: geoLocation.longitude,
        }
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Error updating location',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Location updated',
        description: `Your location has been set to ${locationString}`,
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

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 md:ml-20">
        <div className="text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold text-primary">Profile not found</h2>
          <p className="text-muted-foreground">There was an error loading your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:ml-20 bg-background">
      {/* Hero Section with Gradient */}
      <div className="gradient-hero h-48 md:h-64 relative">
        <div className="absolute inset-0 flex items-end justify-between p-4 md:p-8">
          <div className="flex items-end gap-4">
            <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full bg-card border-4 border-primary text-white shadow-lg">
              <span className="text-3xl md:text-4xl font-bold text-primary">
                {profile.display_name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">{profile.display_name}</h1>
              <p className="text-white/80 text-sm">{profile.membership_tier}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditing(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-card animate-fade-in border-0">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {editing && (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-foreground">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-lg border border-border/50 bg-secondary/50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-primary">0</h3>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-secondary/50 p-4">
                  <h3 className="mb-1 text-sm font-semibold text-primary">0</h3>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
