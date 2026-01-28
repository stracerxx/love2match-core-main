import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from "react-router-dom";
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserProfile } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin, MessageCircle } from 'lucide-react';
import { calculateDistance } from '@/hooks/useGeolocation';

// City name to coordinates mapping for common US cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'jacksonville': { lat: 30.3322, lng: -81.6557 },
  'fort worth': { lat: 32.7555, lng: -97.3308 },
  'columbus': { lat: 39.9612, lng: -82.9988 },
  'charlotte': { lat: 35.2271, lng: -80.8431 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'indianapolis': { lat: 39.7684, lng: -86.1581 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'nashville': { lat: 36.1627, lng: -86.7816 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'grand junction': { lat: 39.0639, lng: -108.5506 },
};

// Parse city name and get coordinates
const getCityCoordinates = (cityString: string | undefined): { lat: number; lng: number } | null => {
  if (!cityString) return null;

  // Normalize the city name (lowercase, remove state abbreviations)
  const normalized = cityString.toLowerCase()
    .replace(/,?\s*(ca|tx|ny|il|az|wa|or|fl|ga|co|nv|ma|tn|pa|oh|nc|mi|nj|va|md|mn|wi|mo|in|ky|sc|al|la|ok|ct|ia|ms|ar|ks|ut|nm|ne|wv|id|hi|nh|me|mt|ri|de|sd|nd|ak|vt|wy|dc)$/i, '')
    .trim();

  // Check for exact match
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }

  // Check for partial match
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }

  return null;
};

interface MapViewProps {
  profiles: UserProfile[];
  userLocation: { lat: number; lng: number } | null;
  onLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
}

interface ProfileWithCoords extends UserProfile {
  _mapLat: number;
  _mapLng: number;
}

const MapView = ({ profiles, userLocation, onLike, onPass }: MapViewProps) => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [profilesWithCoords, setProfilesWithCoords] = useState<ProfileWithCoords[]>([]);

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [36.1699, -115.1398]; // Default to Las Vegas

  // Process profiles to extract/geocode locations
  useEffect(() => {
    const processed: ProfileWithCoords[] = [];

    for (const profile of profiles) {
      const demo = profile.demographics as any;
      let lat: number | null = null;
      let lng: number | null = null;

      // Priority 1: Check for explicit lat/lng in demographics
      if (demo?.location_lat && demo?.location_lng) {
        lat = Number(demo.location_lat);
        lng = Number(demo.location_lng);
      }

      // Priority 2: Check for current_latitude/current_longitude (from CSV structure)
      if (!lat && (profile as any).current_latitude && (profile as any).current_longitude) {
        lat = Number((profile as any).current_latitude);
        lng = Number((profile as any).current_longitude);
      }

      // Priority 3: Try to geocode from city name
      if (!lat) {
        // Try home_city first, then demographics.location
        const cityName = (profile as any).home_city || demo?.location;
        const coords = getCityCoordinates(cityName);
        if (coords) {
          // Add small random offset to prevent markers from stacking
          lat = coords.lat + (Math.random() - 0.5) * 0.05;
          lng = coords.lng + (Math.random() - 0.5) * 0.05;
        }
      }

      // Only add if we have valid coordinates
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        processed.push({
          ...profile,
          _mapLat: lat,
          _mapLng: lng,
        });
      }
    }

    setProfilesWithCoords(processed);
  }, [profiles]);

  const createCustomIcon = (photoUrl?: string) => {
    if (photoUrl) {
      return new DivIcon({
        html: `<div style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 3px solid #ff4458; background: white;">
          <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>`,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
    }
    return new Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  const userIcon = new DivIcon({
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; background: #4CAF50; border: 3px solid white; display: flex; align-items: center; justify-content: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    className: 'user-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {profilesWithCoords.map((profile) => {
          const lat = profile._mapLat;
          const lng = profile._mapLng;
          const distance = userLocation
            ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
            : null;

          return (
            <Marker
              key={profile.id}
              position={[lat, lng]}
              icon={createCustomIcon(profile.photos?.[0])}
              eventHandlers={{
                click: () => setSelectedProfile(profile),
              }}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{profile.display_name}</p>
                  {distance && <p className="text-xs text-muted-foreground">{distance} miles away</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {selectedProfile && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                {selectedProfile.photos?.[0] && (
                  <img
                    src={selectedProfile.photos[0]}
                    alt={selectedProfile.display_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedProfile.display_name}</h3>
                  {((selectedProfile as any).home_city || selectedProfile.demographics?.location) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{String((selectedProfile as any).home_city || selectedProfile.demographics?.location)}</span>
                    </div>
                  )}
                  {selectedProfile.bio && (
                    <p className="text-sm mt-1 line-clamp-2">{selectedProfile.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onPass(selectedProfile);
                    setSelectedProfile(null);
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Pass
                </Button>
                <Button
                  className="flex-1 gradient-primary"
                  onClick={() => {
                    onLike(selectedProfile);
                    setSelectedProfile(null);
                  }}
                >
                  <Heart className="mr-1 h-4 w-4" fill="currentColor" />
                  Like
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full mt-2 flex items-center justify-center gap-2 font-bold h-10 border-primary/20 hover:bg-primary/5 transition-colors"
                onClick={() => {
                  navigate("/messages", { state: { partnerId: selectedProfile.id } });
                }}
              >
                <MessageCircle className="h-4 w-4 text-primary" />
                Message Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;
