/**
 * Geocoding utilities for accurate location resolution
 * 
 * This module provides functions to convert city names to coordinates
 * with proper state disambiguation and fallback to OpenStreetMap API.
 */

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

// US State abbreviations to full names for better matching
export const STATE_ABBREVIATIONS: Record<string, string> = {
  'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas',
  'ca': 'california', 'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware',
  'fl': 'florida', 'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho',
  'il': 'illinois', 'in': 'indiana', 'ia': 'iowa', 'ks': 'kansas',
  'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
  'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
  'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada',
  'nh': 'new hampshire', 'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york',
  'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
  'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
  'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah',
  'vt': 'vermont', 'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia',
  'wi': 'wisconsin', 'wy': 'wyoming', 'dc': 'district of columbia'
};

// Reverse lookup: full state name to abbreviation
export const STATE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_ABBREVIATIONS).map(([abbr, name]) => [name, abbr])
);

/**
 * Parse a location string into city and state components
 * Handles formats like:
 * - "New York, NY"
 * - "Los Angeles, California"
 * - "Las Vegas"
 * - "Portland, OR"
 */
export function parseLocationString(locationString: string): { city: string; state: string | null } {
  if (!locationString) {
    return { city: '', state: null };
  }

  const trimmed = locationString.trim().toLowerCase();
  
  // Try to split by comma
  const parts = trimmed.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    const city = parts[0];
    const stateOrCountry = parts[parts.length - 1];
    
    // Check if it's a US state abbreviation
    if (STATE_ABBREVIATIONS[stateOrCountry]) {
      return { city, state: stateOrCountry };
    }
    
    // Check if it's a full state name
    if (STATE_NAMES[stateOrCountry]) {
      return { city, state: STATE_NAMES[stateOrCountry] };
    }
    
    // Could be a country or unknown - just use the city
    return { city, state: null };
  }
  
  // No comma - check if the last word is a state abbreviation
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const lastWord = words[words.length - 1];
    if (STATE_ABBREVIATIONS[lastWord]) {
      return {
        city: words.slice(0, -1).join(' '),
        state: lastWord
      };
    }
  }
  
  // Just a city name
  return { city: trimmed, state: null };
}

/**
 * Normalize a city name for matching
 * - Lowercase
 * - Remove extra whitespace
 * - Handle common variations
 */
export function normalizeCityName(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^st\.?\s+/i, 'saint ') // St. Louis -> Saint Louis
    .replace(/^ft\.?\s+/i, 'fort '); // Ft. Worth -> Fort Worth
}

/**
 * Calculate similarity between two strings (0-1)
 * Uses a simple character-based comparison
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length < s2.length ? s2 : s1;
    return shorter.length / longer.length;
  }
  
  // Simple Levenshtein-based similarity
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
}

/**
 * Validate that coordinates are reasonable
 */
export function validateCoordinates(lat: number | string | null | undefined, lng: number | string | null | undefined): { lat: number; lng: number } | null {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  if (latNum == null || lngNum == null) return null;
  if (isNaN(latNum) || isNaN(lngNum)) return null;
  
  // Check valid ranges
  if (latNum < -90 || latNum > 90) return null;
  if (lngNum < -180 || lngNum > 180) return null;
  
  // Check for null island (0,0) - likely invalid data
  if (latNum === 0 && lngNum === 0) return null;
  
  return { lat: latNum, lng: lngNum };
}

/**
 * Geocode a location string using OpenStreetMap Nominatim API
 * Results are cached to avoid repeated API calls
 */
export async function geocodeLocation(locationString: string): Promise<{ lat: number; lng: number } | null> {
  if (!locationString) return null;
  
  const cacheKey = locationString.toLowerCase().trim();
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }
  
  try {
    // Add USA to improve results for US cities
    const searchQuery = locationString.includes('USA') || locationString.includes('United States')
      ? locationString
      : `${locationString}, USA`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Love2Match Dating App'
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Geocoding API error:', response.status);
      geocodeCache.set(cacheKey, null);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }
    
    geocodeCache.set(cacheKey, null);
    return null;
  } catch (error) {
    console.warn('Geocoding failed:', error);
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Apply a small deterministic offset to coordinates to prevent marker stacking
 * The offset is based on the user ID so it's consistent across sessions
 */
export function applyClusterOffset(
  coords: { lat: number; lng: number },
  uniqueId: string
): { lat: number; lng: number } {
  // Create a simple hash from the ID
  const hash = uniqueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Apply a small offset (max ~150 meters in each direction)
  const offsetLat = ((hash % 100) / 100 - 0.5) * 0.003;
  const offsetLng = (((hash * 7) % 100) / 100 - 0.5) * 0.003;
  
  return {
    lat: coords.lat + offsetLat,
    lng: coords.lng + offsetLng
  };
}

/**
 * Load cached geocoding results from localStorage
 */
export function loadGeocodeCache(): void {
  try {
    const cached = localStorage.getItem('geocode_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.entries(parsed).forEach(([key, value]) => {
        geocodeCache.set(key, value as { lat: number; lng: number } | null);
      });
    }
  } catch (e) {
    // Ignore cache load errors
  }
}

/**
 * Save geocoding cache to localStorage
 */
export function saveGeocodeCache(): void {
  try {
    const cacheObj: Record<string, { lat: number; lng: number } | null> = {};
    geocodeCache.forEach((value, key) => {
      cacheObj[key] = value;
    });
    localStorage.setItem('geocode_cache', JSON.stringify(cacheObj));
  } catch (e) {
    // Ignore cache save errors
  }
}

// Load cache on module initialization
if (typeof window !== 'undefined') {
  loadGeocodeCache();
}
