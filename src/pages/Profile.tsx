/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Camera, Video, Gift, Crown, Star, Users, X,
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
import { getMembershipBadge, getMembershipTier } from '@/lib/membership';
import { uploadUserPhoto, deleteUserPhoto } from '@/lib/storage';

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
    photos: [] as string[],
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
        photos: [],
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
        membership_tier: 'STANDARD',
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
        love_balance: 0,
        love2_balance: 0,
      });
    } else if (data) {
      setProfile(data);
      setFormData({
        display_name: data.display_name || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: (data.demographics as any)?.location || '',
        location_lat: (data.demographics as any)?.location_lat || null,
        location_lng: (data.demographics as any)?.location_lng || null,
        interests: (data.demographics as any)?.interests?.join(', ') || '',
        relationship_goals: (data.demographics as any)?.relationship_goals || '',
        height: (data.demographics as any)?.height || '',
        occupation: (data.demographics as any)?.occupation || '',
        education: (data.demographics as any)?.education || '',
        languages: (data.demographics as any)?.languages?.join(', ') || '',
        zodiac_sign: (data.demographics as any)?.zodiac_sign || '',
        drinking_habits: (data.demographics as any)?.drinking_habits || '',
        smoking_habits: (data.demographics as any)?.smoking_habits || '',
        exercise_habits: (data.demographics as any)?.exercise_habits || '',
        religion: (data.demographics as any)?.religion || '',
        political_views: (data.demographics as any)?.political_views || '',
        has_pets: (data.demographics as any)?.has_pets || false,
        wants_children: (data.demographics as any)?.wants_children || '',
        personality_type: (data.demographics as any)?.personality_type || '',
        love_language: (data.demographics as any)?.love_language || '',
        dealbreakers: (data.demographics as any)?.dealbreakers || '',
        ideal_date: (data.demographics as any)?.ideal_date || '',
        social_media_links: (data.demographics as any)?.social_media_links?.join(', ') || '',
        discovery_radius: (data.discovery_preferences as any)?.radius?.toString() || '50',
        age_range_min: (data.discovery_preferences as any)?.age_range?.min?.toString() || '18',
        age_range_max: (data.discovery_preferences as any)?.age_range?.max?.toString() || '99',
        show_me: (data.discovery_preferences as any)?.show_me || 'everyone',
        notification_enabled: (data.notification_preferences as any)?.enabled || true,
        email_notifications: (data.notification_preferences as any)?.email || true,
        push_notifications: (data.notification_preferences as any)?.push || true,
        sms_notifications: (data.notification_preferences as any)?.sms || false,
        privacy_profile_visible: (data.privacy_settings as any)?.profile_visible || true,
        privacy_show_online_status: (data.privacy_settings as any)?.show_online_status || true,
        privacy_allow_messaging: (data.privacy_settings as any)?.allow_messaging || true,
        privacy_show_location: (data.privacy_settings as any)?.show_location || false,
        photos: data.photos || [],
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    const { data, error } = await uploadUserPhoto(user.id, file);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data?.publicUrl) {
      const updatedPhotos = [...(formData.photos || []), data.publicUrl];
      setFormData({ ...formData, photos: updatedPhotos });

      // Update DB immediately for photos
      const { error: updateError } = await updateUserProfile(user.id, { photos: updatedPhotos });
      if (updateError) {
        toast({
          title: 'Error updating profile',
          description: updateError.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Photo uploaded',
          description: 'Your profile photo has been updated.',
        });
      }
    }
    setSaving(false);
  };

  const handlePhotoDelete = async (photoUrl: string) => {
    if (!user) return;

    setSaving(true);
    const updatedPhotos = formData.photos.filter(p => p !== photoUrl);
    setFormData({ ...formData, photos: updatedPhotos });

    const { error: updateError } = await updateUserProfile(user.id, { photos: updatedPhotos });
    if (updateError) {
      toast({
        title: 'Error updating profile',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      await deleteUserPhoto(photoUrl);
      toast({
        title: 'Photo deleted',
        description: 'The photo has been removed from your profile.',
      });
    }
    setSaving(false);
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

    const { error } = await (supabase as any)
      .from('users')
      .update({
        demographics: {
          ...(profile?.demographics as any),
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
            <div className="flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-full bg-card border-4 border-primary text-white shadow-lg overflow-hidden">
              {formData.photos?.[0] ? (
                <img src={formData.photos[0]} alt={formData.display_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {profile.display_name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <div className="mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">{profile.display_name}</h1>
              <p className="text-white/80 text-sm">{getMembershipBadge(getMembershipTier(profile))}</p>
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
              {/* Photo Management Section */}
              <div className="space-y-4">
                <Label className="text-foreground">Profile Photos</Label>
                <div className="grid grid-cols-3 gap-2">
                  {formData.photos?.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={photo} alt={`Profile ${index}`} className="h-full w-full object-cover" />
                      {editing && (
                        <button
                          onClick={() => handlePhotoDelete(photo)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {editing && (formData.photos?.length || 0) < 6 && (
                    <label className="flex items-center justify-center aspect-square rounded-lg border-2 border-dashed border-primary/30 hover:border-primary transition-colors cursor-pointer bg-primary/5">
                      <div className="text-center">
                        <Camera className="h-6 w-6 mx-auto text-primary/50" />
                        <span className="text-[10px] mt-1 block text-primary/50 font-medium">Add Photo</span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={saving} />
                    </label>
                  )}
                </div>
              </div>

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

                {/* Location Section */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="City, State"
                      className={editing ? 'flex-1' : 'flex-1 bg-muted/50 border-border/50'}
                    />
                    {editing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleUpdateLocation}
                        disabled={geoLoading || !geoLocation}
                        className="whitespace-nowrap"
                      >
                        {geoLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            Use Current
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Basic Info Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-foreground">Occupation</Label>
                    <Input
                      id="occupation"
                      value={formData.occupation}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="Your job title"
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-foreground">Education</Label>
                    <Input
                      id="education"
                      value={formData.education}
                      onChange={(e) =>
                        setFormData({ ...formData, education: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="Your education"
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-foreground">Height</Label>
                    <Input
                      id="height"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="e.g., 5'10&quot;"
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zodiac_sign" className="text-foreground">Zodiac Sign</Label>
                    <Input
                      id="zodiac_sign"
                      value={formData.zodiac_sign}
                      onChange={(e) =>
                        setFormData({ ...formData, zodiac_sign: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="e.g., Aries"
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-foreground">Interests</Label>
                  <Input
                    id="interests"
                    value={formData.interests}
                    onChange={(e) =>
                      setFormData({ ...formData, interests: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="Travel, Music, Cooking (comma separated)"
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-foreground">Languages</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) =>
                      setFormData({ ...formData, languages: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="English, Spanish (comma separated)"
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship_goals" className="text-foreground">Relationship Goals</Label>
                  <Input
                    id="relationship_goals"
                    value={formData.relationship_goals}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship_goals: e.target.value })
                    }
                    disabled={!editing}
                    placeholder="Looking for..."
                    className={editing ? '' : 'bg-muted/50 border-border/50'}
                  />
                </div>

                {/* Lifestyle Section */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Lifestyle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drinking_habits" className="text-foreground">Drinking</Label>
                      <Input
                        id="drinking_habits"
                        value={formData.drinking_habits}
                        onChange={(e) =>
                          setFormData({ ...formData, drinking_habits: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., Socially"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smoking_habits" className="text-foreground">Smoking</Label>
                      <Input
                        id="smoking_habits"
                        value={formData.smoking_habits}
                        onChange={(e) =>
                          setFormData({ ...formData, smoking_habits: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., Never"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="exercise_habits" className="text-foreground">Exercise</Label>
                      <Input
                        id="exercise_habits"
                        value={formData.exercise_habits}
                        onChange={(e) =>
                          setFormData({ ...formData, exercise_habits: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., Daily"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wants_children" className="text-foreground">Want Children</Label>
                      <Input
                        id="wants_children"
                        value={formData.wants_children}
                        onChange={(e) =>
                          setFormData({ ...formData, wants_children: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., Someday"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <Label htmlFor="has_pets" className="text-foreground">Has Pets</Label>
                    <Switch
                      id="has_pets"
                      checked={formData.has_pets}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, has_pets: checked })
                      }
                      disabled={!editing}
                    />
                  </div>
                </div>

                {/* Personality Section */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Personality</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="personality_type" className="text-foreground">Personality Type</Label>
                      <Input
                        id="personality_type"
                        value={formData.personality_type}
                        onChange={(e) =>
                          setFormData({ ...formData, personality_type: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., INFJ"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="love_language" className="text-foreground">Love Language</Label>
                      <Input
                        id="love_language"
                        value={formData.love_language}
                        onChange={(e) =>
                          setFormData({ ...formData, love_language: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="e.g., Quality Time"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="ideal_date" className="text-foreground">Ideal Date</Label>
                    <Textarea
                      id="ideal_date"
                      value={formData.ideal_date}
                      onChange={(e) =>
                        setFormData({ ...formData, ideal_date: e.target.value })
                      }
                      disabled={!editing}
                      rows={2}
                      placeholder="Describe your ideal date..."
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="dealbreakers" className="text-foreground">Dealbreakers</Label>
                    <Input
                      id="dealbreakers"
                      value={formData.dealbreakers}
                      onChange={(e) =>
                        setFormData({ ...formData, dealbreakers: e.target.value })
                      }
                      disabled={!editing}
                      placeholder="Things you can't compromise on"
                      className={editing ? '' : 'bg-muted/50 border-border/50'}
                    />
                  </div>
                </div>

                {/* Beliefs Section */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Beliefs & Values</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion" className="text-foreground">Religion</Label>
                      <Input
                        id="religion"
                        value={formData.religion}
                        onChange={(e) =>
                          setFormData({ ...formData, religion: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="Your faith"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="political_views" className="text-foreground">Political Views</Label>
                      <Input
                        id="political_views"
                        value={formData.political_views}
                        onChange={(e) =>
                          setFormData({ ...formData, political_views: e.target.value })
                        }
                        disabled={!editing}
                        placeholder="Your views"
                        className={editing ? '' : 'bg-muted/50 border-border/50'}
                      />
                    </div>
                  </div>
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
