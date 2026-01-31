import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from "react-router-dom";
import { Icon, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { UserProfile } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import { calculateDistance } from '@/hooks/useGeolocation';

// City name to coordinates mapping for common US cities
// This is used as a fallback when users have a city name but no explicit coordinates
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
  'henderson': { lat: 36.0395, lng: -114.9817 },
  'reno': { lat: 39.5296, lng: -119.8138 },
  'sacramento': { lat: 38.5816, lng: -121.4944 },
  'fresno': { lat: 36.7378, lng: -119.7871 },
  'long beach': { lat: 33.7701, lng: -118.1937 },
  'oakland': { lat: 37.8044, lng: -122.2712 },
  'bakersfield': { lat: 35.3733, lng: -119.0187 },
  'anaheim': { lat: 33.8366, lng: -117.9143 },
  'santa ana': { lat: 33.7455, lng: -117.8677 },
  'riverside': { lat: 33.9533, lng: -117.3962 },
  'stockton': { lat: 37.9577, lng: -121.2908 },
  'irvine': { lat: 33.6846, lng: -117.8265 },
  'chula vista': { lat: 32.6401, lng: -117.0842 },
  'fremont': { lat: 37.5485, lng: -121.9886 },
  'san bernardino': { lat: 34.1083, lng: -117.2898 },
  'modesto': { lat: 37.6391, lng: -120.9969 },
  'fontana': { lat: 34.0922, lng: -117.4350 },
  'moreno valley': { lat: 33.9425, lng: -117.2297 },
  'glendale': { lat: 34.1425, lng: -118.2551 },
  'huntington beach': { lat: 33.6595, lng: -117.9988 },
  'santa clarita': { lat: 34.3917, lng: -118.5426 },
  'garden grove': { lat: 33.7739, lng: -117.9414 },
  'oceanside': { lat: 33.1959, lng: -117.3795 },
  'rancho cucamonga': { lat: 34.1064, lng: -117.5931 },
  'ontario': { lat: 34.0633, lng: -117.6509 },
  'santa rosa': { lat: 38.4404, lng: -122.7141 },
  'elk grove': { lat: 38.4088, lng: -121.3716 },
  'corona': { lat: 33.8753, lng: -117.5664 },
  'lancaster': { lat: 34.6868, lng: -118.1542 },
  'palmdale': { lat: 34.5794, lng: -118.1165 },
  'salinas': { lat: 36.6777, lng: -121.6555 },
  'pomona': { lat: 34.0551, lng: -117.7500 },
  'hayward': { lat: 37.6688, lng: -122.0808 },
  'escondido': { lat: 33.1192, lng: -117.0864 },
  'sunnyvale': { lat: 37.3688, lng: -122.0363 },
  'torrance': { lat: 33.8358, lng: -118.3406 },
  'pasadena': { lat: 34.1478, lng: -118.1445 },
  'orange': { lat: 33.7879, lng: -117.8531 },
  'fullerton': { lat: 33.8703, lng: -117.9242 },
  'thousand oaks': { lat: 34.1706, lng: -118.8376 },
  'roseville': { lat: 38.7521, lng: -121.2880 },
  'concord': { lat: 37.9780, lng: -122.0311 },
  'simi valley': { lat: 34.2694, lng: -118.7815 },
  'santa clara': { lat: 37.3541, lng: -121.9552 },
  'victorville': { lat: 34.5362, lng: -117.2928 },
  'vallejo': { lat: 38.1041, lng: -122.2566 },
  'berkeley': { lat: 37.8716, lng: -122.2727 },
  'el monte': { lat: 34.0686, lng: -118.0276 },
  'downey': { lat: 33.9401, lng: -118.1332 },
  'costa mesa': { lat: 33.6412, lng: -117.9187 },
  'inglewood': { lat: 33.9617, lng: -118.3531 },
  'carlsbad': { lat: 33.1581, lng: -117.3506 },
  'san buenaventura': { lat: 34.2746, lng: -119.2290 },
  'ventura': { lat: 34.2746, lng: -119.2290 },
  'fairfield': { lat: 38.2494, lng: -122.0400 },
  'west covina': { lat: 34.0686, lng: -117.9390 },
  'murrieta': { lat: 33.5539, lng: -117.2139 },
  'richmond': { lat: 37.9358, lng: -122.3478 },
  'norwalk': { lat: 33.9022, lng: -118.0817 },
  'antioch': { lat: 38.0049, lng: -121.8058 },
  'temecula': { lat: 33.4936, lng: -117.1484 },
  'burbank': { lat: 34.1808, lng: -118.3090 },
  'daly city': { lat: 37.6879, lng: -122.4702 },
  'el cajon': { lat: 32.7948, lng: -116.9625 },
  'san mateo': { lat: 37.5630, lng: -122.3255 },
  'clovis': { lat: 36.8252, lng: -119.7029 },
  'compton': { lat: 33.8958, lng: -118.2201 },
  'jurupa valley': { lat: 33.9972, lng: -117.4855 },
  'vista': { lat: 33.2000, lng: -117.2425 },
  'south gate': { lat: 33.9547, lng: -118.2120 },
  'mission viejo': { lat: 33.6000, lng: -117.6720 },
  'vacaville': { lat: 38.3566, lng: -121.9877 },
  'carson': { lat: 33.8317, lng: -118.2820 },
  'hesperia': { lat: 34.4264, lng: -117.3009 },
  'santa maria': { lat: 34.9530, lng: -120.4357 },
  'redding': { lat: 40.5865, lng: -122.3917 },
  'westminster': { lat: 33.7513, lng: -117.9940 },
  'santa monica': { lat: 34.0195, lng: -118.4912 },
  'chico': { lat: 39.7285, lng: -121.8375 },
  'newport beach': { lat: 33.6189, lng: -117.9289 },
  'san leandro': { lat: 37.7249, lng: -122.1561 },
  'san marcos': { lat: 33.1434, lng: -117.1661 },
  'whittier': { lat: 33.9792, lng: -118.0328 },
  'hawthorne': { lat: 33.9164, lng: -118.3526 },
  'citrus heights': { lat: 38.7071, lng: -121.2810 },
  'alhambra': { lat: 34.0953, lng: -118.1270 },
  'tracy': { lat: 37.7397, lng: -121.4252 },
  'livermore': { lat: 37.6819, lng: -121.7680 },
  'buena park': { lat: 33.8675, lng: -117.9981 },
  'menifee': { lat: 33.6971, lng: -117.1850 },
  'hemet': { lat: 33.7476, lng: -116.9719 },
  'lakewood': { lat: 33.8536, lng: -118.1340 },
  'merced': { lat: 37.3022, lng: -120.4830 },
  'chino': { lat: 34.0122, lng: -117.6889 },
  'indio': { lat: 33.7206, lng: -116.2156 },
  'redwood city': { lat: 37.4852, lng: -122.2364 },
  'lake forest': { lat: 33.6469, lng: -117.6891 },
  'napa': { lat: 38.2975, lng: -122.2869 },
  'tustin': { lat: 33.7458, lng: -117.8262 },
  'bellflower': { lat: 33.8817, lng: -118.1170 },
  'mountain view': { lat: 37.3861, lng: -122.0839 },
  'chino hills': { lat: 33.9898, lng: -117.7326 },
  'baldwin park': { lat: 34.0853, lng: -117.9609 },
  'alameda': { lat: 37.7652, lng: -122.2416 },
  'upland': { lat: 34.0975, lng: -117.6484 },
  'san ramon': { lat: 37.7799, lng: -121.9780 },
  'folsom': { lat: 38.6780, lng: -121.1761 },
  'pleasanton': { lat: 37.6624, lng: -121.8747 },
  'lynwood': { lat: 33.9303, lng: -118.2115 },
  'union city': { lat: 37.5934, lng: -122.0439 },
  'apple valley': { lat: 34.5008, lng: -117.1859 },
  'redlands': { lat: 34.0556, lng: -117.1825 },
  'turlock': { lat: 37.4947, lng: -120.8466 },
  'perris': { lat: 33.7825, lng: -117.2286 },
  'manteca': { lat: 37.7974, lng: -121.2161 },
  'milpitas': { lat: 37.4323, lng: -121.8996 },
  'redondo beach': { lat: 33.8492, lng: -118.3884 },
  'davis': { lat: 38.5449, lng: -121.7405 },
  'camarillo': { lat: 34.2164, lng: -119.0376 },
  'yuba city': { lat: 39.1404, lng: -121.6169 },
  'rancho cordova': { lat: 38.5891, lng: -121.3028 },
  'palo alto': { lat: 37.4419, lng: -122.1430 },
  'yorba linda': { lat: 33.8886, lng: -117.8131 },
  'walnut creek': { lat: 37.9101, lng: -122.0652 },
  'south san francisco': { lat: 37.6547, lng: -122.4077 },
  'san clemente': { lat: 33.4270, lng: -117.6120 },
  'pittsburg': { lat: 38.0280, lng: -121.8847 },
  'laguna niguel': { lat: 33.5225, lng: -117.7076 },
  'pico rivera': { lat: 33.9831, lng: -118.0967 },
  'montebello': { lat: 34.0165, lng: -118.1138 },
  'lodi': { lat: 38.1302, lng: -121.2724 },
  'madera': { lat: 36.9613, lng: -120.0607 },
  'santa cruz': { lat: 36.9741, lng: -122.0308 },
  'la habra': { lat: 33.9319, lng: -117.9462 },
  'encinitas': { lat: 33.0370, lng: -117.2920 },
  'monterey park': { lat: 34.0625, lng: -118.1228 },
  'tulare': { lat: 36.2077, lng: -119.3473 },
  'cupertino': { lat: 37.3230, lng: -122.0322 },
  'gardena': { lat: 33.8883, lng: -118.3090 },
  'national city': { lat: 32.6781, lng: -117.0992 },
  'rocklin': { lat: 38.7907, lng: -121.2358 },
  'petaluma': { lat: 38.2324, lng: -122.6367 },
  'huntington park': { lat: 33.9817, lng: -118.2251 },
  'san rafael': { lat: 37.9735, lng: -122.5311 },
  'la mesa': { lat: 32.7678, lng: -117.0231 },
  'arcadia': { lat: 34.1397, lng: -118.0353 },
  'fountain valley': { lat: 33.7092, lng: -117.9536 },
  'diamond bar': { lat: 34.0286, lng: -117.8103 },
  'woodland': { lat: 38.6785, lng: -121.7733 },
  'santee': { lat: 32.8384, lng: -116.9739 },
  'lake elsinore': { lat: 33.6681, lng: -117.3273 },
  'porterville': { lat: 36.0652, lng: -119.0168 },
  'paramount': { lat: 33.8894, lng: -118.1597 },
  'eastvale': { lat: 33.9525, lng: -117.5848 },
  'rosemead': { lat: 34.0806, lng: -118.0728 },
  'hanford': { lat: 36.3274, lng: -119.6457 },
  'highland': { lat: 34.1283, lng: -117.2086 },
  'brentwood': { lat: 37.9317, lng: -121.6961 },
  'novato': { lat: 38.1074, lng: -122.5697 },
  'colton': { lat: 34.0739, lng: -117.3136 },
  'cathedral city': { lat: 33.7797, lng: -116.4653 },
  'yucaipa': { lat: 34.0336, lng: -117.0431 },
  'watsonville': { lat: 36.9103, lng: -121.7569 },
  'glendora': { lat: 34.1361, lng: -117.8653 },
  'west sacramento': { lat: 38.5805, lng: -121.5302 },
  'covina': { lat: 34.0900, lng: -117.8903 },
  'san jacinto': { lat: 33.7839, lng: -116.9586 },
  'palm desert': { lat: 33.7222, lng: -116.3744 },
  'cerritos': { lat: 33.8583, lng: -118.0647 },
  'aliso viejo': { lat: 33.5676, lng: -117.7256 },
  'poway': { lat: 32.9628, lng: -117.0359 },
  'la mirada': { lat: 33.9172, lng: -118.0120 },
  'rancho santa margarita': { lat: 33.6406, lng: -117.6031 },
  'cypress': { lat: 33.8170, lng: -118.0373 },
  'dublin': { lat: 37.7022, lng: -121.9358 },
  'ceres': { lat: 37.5949, lng: -120.9577 },
  'san luis obispo': { lat: 35.2828, lng: -120.6596 },
  'gilroy': { lat: 37.0058, lng: -121.5683 },
  'coachella': { lat: 33.6803, lng: -116.1739 },
  'bell gardens': { lat: 33.9653, lng: -118.1514 },
  'la quinta': { lat: 33.6633, lng: -116.3100 },
  'azusa': { lat: 34.1336, lng: -117.9076 },
  'san bruno': { lat: 37.6305, lng: -122.4111 },
  'lompoc': { lat: 34.6392, lng: -120.4579 },
  'newark': { lat: 37.5297, lng: -122.0402 },
  'palm springs': { lat: 33.8303, lng: -116.5453 },
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
          // Use deterministic offset based on user ID to prevent markers from stacking
          // while keeping the same user in the same position consistently
          // The offset is very small (0.002 degrees = ~0.14 miles / ~220 meters)
          // This keeps users within their city while preventing exact overlap
          const idHash = String(profile.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const offsetLat = ((idHash % 100) / 100 - 0.5) * 0.004; // Max ~0.28 miles offset
          const offsetLng = (((idHash * 7) % 100) / 100 - 0.5) * 0.004;
          lat = coords.lat + offsetLat;
          lng = coords.lng + offsetLng;
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
