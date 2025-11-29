import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserProfile } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, MapPin } from 'lucide-react';
import { calculateDistance } from '@/hooks/useGeolocation';

interface MapViewProps {
  profiles: UserProfile[];
  userLocation: { lat: number; lng: number } | null;
  onLike: (profile: UserProfile) => void;
  onPass: (profile: UserProfile) => void;
}

const MapView = ({ profiles, userLocation, onLike, onPass }: MapViewProps) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [37.7749, -122.4194];

  const profilesWithLocation = profiles.filter(p => {
    const demo = p.demographics as any;
    return demo?.location_lat && demo?.location_lng;
  });

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

        {profilesWithLocation.map((profile) => {
          const demo = profile.demographics as any;
          const lat = Number(demo.location_lat);
          const lng = Number(demo.location_lng);
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
                  {selectedProfile.demographics?.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{String(selectedProfile.demographics.location)}</span>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapView;
