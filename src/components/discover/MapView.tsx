import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from "react-router-dom";
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserProfile } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import { calculateDistance } from '@/hooks/useGeolocation';
import { CITY_COORDINATES } from './cityCoordinates';

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
  radiusFilter?: number;
}

interface ProfileWithCoords extends UserProfile {
  _mapLat: number;
  _mapLng: number;
}

const MapView = ({ profiles, userLocation, onLike, onPass, radiusFilter }: MapViewProps) => {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const defaultCenter: [number, number] = useMemo(() => userLocation
    ? [userLocation.lat, userLocation.lng]
    : [36.1699, -115.1398], [userLocation]); // Default to Las Vegas

  // Process profiles to extract/geocode locations
  const profilesWithCoords = useMemo(() => {
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

      // Priority 2: Check for current_latitude/current_longitude
      if (!lat && (profile as any).current_latitude && (profile as any).current_longitude) {
        lat = Number((profile as any).current_latitude);
        lng = Number((profile as any).current_longitude);
      }

      // Priority 3: Geocode from city name
      if (!lat) {
        const cityName = (profile as any).home_city || demo?.location;
        const coords = getCityCoordinates(cityName);
        if (coords) {
          const idHash = String(profile.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const offsetLat = ((idHash % 100) / 100 - 0.5) * 0.004;
          const offsetLng = (((idHash * 7) % 100) / 100 - 0.5) * 0.004;
          lat = coords.lat + offsetLat;
          lng = coords.lng + offsetLng;
        }
      }

      // Final validation and distance filter
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        if (radiusFilter && userLocation) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
          if (dist > radiusFilter) continue;
        }

        processed.push({
          ...profile,
          _mapLat: lat,
          _mapLng: lng,
        });
      }
    }
    return processed;
  }, [profiles, userLocation, radiusFilter]);

  const createCustomIcon = useMemo(() => (photoUrl?: string) => {
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
  }, []);

  const userIcon = useMemo(() => new DivIcon({
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; background: #4CAF50; border: 3px solid white; display: flex; align-items: center; justify-content: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    className: 'user-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  }), []);

  const profilesWithoutLocation = profiles.length - profilesWithCoords.length;

  return (
    <div className="relative w-full h-full">
      {/* Status indicator showing location data availability */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-md">
          <MapPin className="h-3 w-3 mr-1" />
          {profilesWithCoords.length} profiles on map
        </Badge>
        {profilesWithoutLocation > 0 && (
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm shadow-md text-muted-foreground">
            <AlertCircle className="h-3 w-3 mr-1" />
            {profilesWithoutLocation} without location
          </Badge>
        )}
        {!userLocation && (
          <Badge variant="outline" className="bg-yellow-100/90 backdrop-blur-sm shadow-md text-yellow-800 border-yellow-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Set your location in Profile
          </Badge>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={userLocation ? 12 : 10}
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

        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={50}
        >
          {profilesWithCoords.map((profile) => {
            const lat = profile._mapLat;
            const lng = profile._mapLng;

            return (
              <Marker
                key={profile.id}
                position={[lat, lng]}
                icon={createCustomIcon(profile.photos?.[0])}
                eventHandlers={{
                  click: () => setSelectedProfile(profile),
                }}
              />
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Empty state when no profiles have location data */}
      {profilesWithCoords.length === 0 && profiles.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[999] rounded-lg">
          <Card className="max-w-sm mx-4">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg mb-2">No Location Data</h3>
              <p className="text-muted-foreground text-sm mb-4">
                None of the {profiles.length} profiles have location data set.
                Users need to update their location in their profile settings to appear on the map.
              </p>
              <p className="text-xs text-muted-foreground">
                Tip: Go to Profile → Update Location to set your location
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
