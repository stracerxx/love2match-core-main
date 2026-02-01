/**
 * City coordinates database with state information for disambiguation
 * 
 * Structure: { 'city name': { lat, lng, state (optional) } }
 * 
 * Cities with the same name in different states have the state field set.
 * The lookup function should prefer matches with matching state when available.
 */

export interface CityCoordinate {
    lat: number;
    lng: number;
    state?: string; // State abbreviation (lowercase) for disambiguation
}

export const CITY_COORDINATES: Record<string, CityCoordinate> = {
    // Major US Cities (alphabetical)
    'albuquerque': { lat: 35.0844, lng: -106.6504, state: 'nm' },
    'anchorage': { lat: 61.2181, lng: -149.9003, state: 'ak' },
    'arlington': { lat: 32.7357, lng: -97.1081, state: 'tx' },
    'arlington va': { lat: 38.8816, lng: -77.0910, state: 'va' },
    'atlanta': { lat: 33.7490, lng: -84.3880, state: 'ga' },
    'aurora': { lat: 39.7294, lng: -104.8319, state: 'co' },
    'aurora il': { lat: 41.7606, lng: -88.3201, state: 'il' },
    'austin': { lat: 30.2672, lng: -97.7431, state: 'tx' },
    'bakersfield': { lat: 35.3733, lng: -119.0187, state: 'ca' },
    'baltimore': { lat: 39.2904, lng: -76.6122, state: 'md' },
    'baton rouge': { lat: 30.4515, lng: -91.1871, state: 'la' },
    'birmingham': { lat: 33.5207, lng: -86.8025, state: 'al' },
    'boise': { lat: 43.6150, lng: -116.2023, state: 'id' },
    'boston': { lat: 42.3601, lng: -71.0589, state: 'ma' },
    'buffalo': { lat: 42.8864, lng: -78.8784, state: 'ny' },
    'chandler': { lat: 33.3062, lng: -111.8413, state: 'az' },
    'charlotte': { lat: 35.2271, lng: -80.8431, state: 'nc' },
    'chesapeake': { lat: 36.7682, lng: -76.2875, state: 'va' },
    'chicago': { lat: 41.8781, lng: -87.6298, state: 'il' },
    'chula vista': { lat: 32.6401, lng: -117.0842, state: 'ca' },
    'cincinnati': { lat: 39.1031, lng: -84.5120, state: 'oh' },
    'cleveland': { lat: 41.4993, lng: -81.6944, state: 'oh' },
    'colorado springs': { lat: 38.8339, lng: -104.8214, state: 'co' },
    'columbus': { lat: 39.9612, lng: -82.9988, state: 'oh' },
    'columbus ga': { lat: 32.4610, lng: -84.9877, state: 'ga' },
    'corpus christi': { lat: 27.8006, lng: -97.3964, state: 'tx' },
    'dallas': { lat: 32.7767, lng: -96.7970, state: 'tx' },
    'denver': { lat: 39.7392, lng: -104.9903, state: 'co' },
    'detroit': { lat: 42.3314, lng: -83.0458, state: 'mi' },
    'durham': { lat: 35.9940, lng: -78.8986, state: 'nc' },
    'el paso': { lat: 31.7619, lng: -106.4850, state: 'tx' },
    'fort wayne': { lat: 41.0793, lng: -85.1394, state: 'in' },
    'fort worth': { lat: 32.7555, lng: -97.3308, state: 'tx' },
    'fremont': { lat: 37.5485, lng: -121.9886, state: 'ca' },
    'fresno': { lat: 36.7378, lng: -119.7871, state: 'ca' },
    'gilbert': { lat: 33.3528, lng: -111.7890, state: 'az' },
    'glendale': { lat: 33.5387, lng: -112.1860, state: 'az' },
    'glendale ca': { lat: 34.1425, lng: -118.2551, state: 'ca' },
    'greensboro': { lat: 36.0726, lng: -79.7920, state: 'nc' },
    'henderson': { lat: 36.0395, lng: -114.9817, state: 'nv' },
    'hialeah': { lat: 25.8576, lng: -80.2781, state: 'fl' },
    'honolulu': { lat: 21.3069, lng: -157.8583, state: 'hi' },
    'houston': { lat: 29.7604, lng: -95.3698, state: 'tx' },
    'indianapolis': { lat: 39.7684, lng: -86.1581, state: 'in' },
    'irvine': { lat: 33.6846, lng: -117.8265, state: 'ca' },
    'irving': { lat: 32.8140, lng: -96.9489, state: 'tx' },
    'jacksonville': { lat: 30.3322, lng: -81.6557, state: 'fl' },
    'jersey city': { lat: 40.7178, lng: -74.0431, state: 'nj' },
    'kansas city': { lat: 39.0997, lng: -94.5786, state: 'mo' },
    'kansas city ks': { lat: 39.1141, lng: -94.6275, state: 'ks' },
    'las vegas': { lat: 36.1699, lng: -115.1398, state: 'nv' },
    'laredo': { lat: 27.5306, lng: -99.4803, state: 'tx' },
    'lexington': { lat: 38.0406, lng: -84.5037, state: 'ky' },
    'lincoln': { lat: 40.8258, lng: -96.6852, state: 'ne' },
    'long beach': { lat: 33.7701, lng: -118.1937, state: 'ca' },
    'los angeles': { lat: 34.0522, lng: -118.2437, state: 'ca' },
    'louisville': { lat: 38.2527, lng: -85.7585, state: 'ky' },
    'lubbock': { lat: 33.5779, lng: -101.8552, state: 'tx' },
    'madison': { lat: 43.0731, lng: -89.4012, state: 'wi' },
    'memphis': { lat: 35.1495, lng: -90.0490, state: 'tn' },
    'mesa': { lat: 33.4152, lng: -111.8315, state: 'az' },
    'miami': { lat: 25.7617, lng: -80.1918, state: 'fl' },
    'milwaukee': { lat: 43.0389, lng: -87.9065, state: 'wi' },
    'minneapolis': { lat: 44.9778, lng: -93.2650, state: 'mn' },
    'nashville': { lat: 36.1627, lng: -86.7816, state: 'tn' },
    'new orleans': { lat: 29.9511, lng: -90.0715, state: 'la' },
    'new york': { lat: 40.7128, lng: -74.0060, state: 'ny' },
    'new york city': { lat: 40.7128, lng: -74.0060, state: 'ny' },
    'nyc': { lat: 40.7128, lng: -74.0060, state: 'ny' },
    'manhattan': { lat: 40.7831, lng: -73.9712, state: 'ny' },
    'brooklyn': { lat: 40.6782, lng: -73.9442, state: 'ny' },
    'queens': { lat: 40.7282, lng: -73.7949, state: 'ny' },
    'bronx': { lat: 40.8448, lng: -73.8648, state: 'ny' },
    'staten island': { lat: 40.5795, lng: -74.1502, state: 'ny' },
    'newark': { lat: 40.7357, lng: -74.1724, state: 'nj' },
    'norfolk': { lat: 36.8508, lng: -76.2859, state: 'va' },
    'north las vegas': { lat: 36.1989, lng: -115.1175, state: 'nv' },
    'oakland': { lat: 37.8044, lng: -122.2712, state: 'ca' },
    'oklahoma city': { lat: 35.4676, lng: -97.5164, state: 'ok' },
    'omaha': { lat: 41.2565, lng: -95.9345, state: 'ne' },
    'orlando': { lat: 28.5383, lng: -81.3792, state: 'fl' },
    'philadelphia': { lat: 39.9526, lng: -75.1652, state: 'pa' },
    'phoenix': { lat: 33.4484, lng: -112.0740, state: 'az' },
    'pittsburgh': { lat: 40.4406, lng: -79.9959, state: 'pa' },
    'plano': { lat: 33.0198, lng: -96.6989, state: 'tx' },
    'portland': { lat: 45.5152, lng: -122.6784, state: 'or' },
    'portland me': { lat: 43.6591, lng: -70.2568, state: 'me' },
    'portland maine': { lat: 43.6591, lng: -70.2568, state: 'me' },
    'raleigh': { lat: 35.7796, lng: -78.6382, state: 'nc' },
    'reno': { lat: 39.5296, lng: -119.8138, state: 'nv' },
    'richmond': { lat: 37.5407, lng: -77.4360, state: 'va' },
    'richmond ca': { lat: 37.9358, lng: -122.3478, state: 'ca' },
    'riverside': { lat: 33.9533, lng: -117.3962, state: 'ca' },
    'rochester': { lat: 43.1566, lng: -77.6088, state: 'ny' },
    'sacramento': { lat: 38.5816, lng: -121.4944, state: 'ca' },
    'saint louis': { lat: 38.6270, lng: -90.1994, state: 'mo' },
    'st louis': { lat: 38.6270, lng: -90.1994, state: 'mo' },
    'st. louis': { lat: 38.6270, lng: -90.1994, state: 'mo' },
    'saint paul': { lat: 44.9537, lng: -93.0900, state: 'mn' },
    'st paul': { lat: 44.9537, lng: -93.0900, state: 'mn' },
    'st. paul': { lat: 44.9537, lng: -93.0900, state: 'mn' },
    'salt lake city': { lat: 40.7608, lng: -111.8910, state: 'ut' },
    'san antonio': { lat: 29.4241, lng: -98.4936, state: 'tx' },
    'san bernardino': { lat: 34.1083, lng: -117.2898, state: 'ca' },
    'san diego': { lat: 32.7157, lng: -117.1611, state: 'ca' },
    'san francisco': { lat: 37.7749, lng: -122.4194, state: 'ca' },
    'san jose': { lat: 37.3382, lng: -121.8863, state: 'ca' },
    'santa ana': { lat: 33.7455, lng: -117.8677, state: 'ca' },
    'santa clarita': { lat: 34.3917, lng: -118.5426, state: 'ca' },
    'scottsdale': { lat: 33.4942, lng: -111.9261, state: 'az' },
    'seattle': { lat: 47.6062, lng: -122.3321, state: 'wa' },
    'spokane': { lat: 47.6588, lng: -117.4260, state: 'wa' },
    'springfield': { lat: 37.2090, lng: -93.2923, state: 'mo' },
    'springfield il': { lat: 39.7817, lng: -89.6501, state: 'il' },
    'springfield ma': { lat: 42.1015, lng: -72.5898, state: 'ma' },
    'springfield oh': { lat: 39.9242, lng: -83.8088, state: 'oh' },
    'stockton': { lat: 37.9577, lng: -121.2908, state: 'ca' },
    'tampa': { lat: 27.9506, lng: -82.4572, state: 'fl' },
    'tempe': { lat: 33.4255, lng: -111.9400, state: 'az' },
    'toledo': { lat: 41.6528, lng: -83.5379, state: 'oh' },
    'tucson': { lat: 32.2226, lng: -110.9747, state: 'az' },
    'tulsa': { lat: 36.1540, lng: -95.9928, state: 'ok' },
    'virginia beach': { lat: 36.8529, lng: -75.9780, state: 'va' },
    'washington': { lat: 38.9072, lng: -77.0369, state: 'dc' },
    'washington dc': { lat: 38.9072, lng: -77.0369, state: 'dc' },
    'dc': { lat: 38.9072, lng: -77.0369, state: 'dc' },
    'wichita': { lat: 37.6872, lng: -97.3301, state: 'ks' },
    'winston-salem': { lat: 36.0999, lng: -80.2442, state: 'nc' },
    'winston salem': { lat: 36.0999, lng: -80.2442, state: 'nc' },

    // Additional California cities
    'alameda': { lat: 37.7652, lng: -122.2416, state: 'ca' },
    'alhambra': { lat: 34.0953, lng: -118.1270, state: 'ca' },
    'aliso viejo': { lat: 33.5676, lng: -117.7256, state: 'ca' },
    'anaheim': { lat: 33.8366, lng: -117.9143, state: 'ca' },
    'antioch': { lat: 38.0049, lng: -121.8058, state: 'ca' },
    'apple valley': { lat: 34.5008, lng: -117.1859, state: 'ca' },
    'arcadia': { lat: 34.1397, lng: -118.0353, state: 'ca' },
    'azusa': { lat: 34.1336, lng: -117.9076, state: 'ca' },
    'baldwin park': { lat: 34.0853, lng: -117.9609, state: 'ca' },
    'bell gardens': { lat: 33.9653, lng: -118.1514, state: 'ca' },
    'bellflower': { lat: 33.8817, lng: -118.1170, state: 'ca' },
    'berkeley': { lat: 37.8716, lng: -122.2727, state: 'ca' },
    'brentwood': { lat: 37.9317, lng: -121.6961, state: 'ca' },
    'buena park': { lat: 33.8675, lng: -117.9981, state: 'ca' },
    'burbank': { lat: 34.1808, lng: -118.3090, state: 'ca' },
    'camarillo': { lat: 34.2164, lng: -119.0376, state: 'ca' },
    'carlsbad': { lat: 33.1581, lng: -117.3506, state: 'ca' },
    'carson': { lat: 33.8317, lng: -118.2820, state: 'ca' },
    'cathedral city': { lat: 33.7797, lng: -116.4653, state: 'ca' },
    'ceres': { lat: 37.5949, lng: -120.9577, state: 'ca' },
    'cerritos': { lat: 33.8583, lng: -118.0647, state: 'ca' },
    'chico': { lat: 39.7285, lng: -121.8375, state: 'ca' },
    'chino': { lat: 34.0122, lng: -117.6889, state: 'ca' },
    'chino hills': { lat: 33.9898, lng: -117.7326, state: 'ca' },
    'citrus heights': { lat: 38.7071, lng: -121.2810, state: 'ca' },
    'clovis': { lat: 36.8252, lng: -119.7029, state: 'ca' },
    'coachella': { lat: 33.6803, lng: -116.1739, state: 'ca' },
    'colton': { lat: 34.0739, lng: -117.3136, state: 'ca' },
    'compton': { lat: 33.8958, lng: -118.2201, state: 'ca' },
    'concord': { lat: 37.9780, lng: -122.0311, state: 'ca' },
    'corona': { lat: 33.8753, lng: -117.5664, state: 'ca' },
    'costa mesa': { lat: 33.6412, lng: -117.9187, state: 'ca' },
    'covina': { lat: 34.0900, lng: -117.8903, state: 'ca' },
    'cupertino': { lat: 37.3230, lng: -122.0322, state: 'ca' },
    'cypress': { lat: 33.8170, lng: -118.0373, state: 'ca' },
    'daly city': { lat: 37.6879, lng: -122.4702, state: 'ca' },
    'davis': { lat: 38.5449, lng: -121.7405, state: 'ca' },
    'diamond bar': { lat: 34.0286, lng: -117.8103, state: 'ca' },
    'downey': { lat: 33.9401, lng: -118.1332, state: 'ca' },
    'dublin': { lat: 37.7022, lng: -121.9358, state: 'ca' },
    'eastvale': { lat: 33.9525, lng: -117.5848, state: 'ca' },
    'el cajon': { lat: 32.7948, lng: -116.9625, state: 'ca' },
    'el monte': { lat: 34.0686, lng: -118.0276, state: 'ca' },
    'elk grove': { lat: 38.4088, lng: -121.3716, state: 'ca' },
    'encinitas': { lat: 33.0370, lng: -117.2920, state: 'ca' },
    'escondido': { lat: 33.1192, lng: -117.0864, state: 'ca' },
    'fairfield': { lat: 38.2494, lng: -122.0400, state: 'ca' },
    'folsom': { lat: 38.6780, lng: -121.1761, state: 'ca' },
    'fontana': { lat: 34.0922, lng: -117.4350, state: 'ca' },
    'fountain valley': { lat: 33.7092, lng: -117.9536, state: 'ca' },
    'fullerton': { lat: 33.8703, lng: -117.9242, state: 'ca' },
    'garden grove': { lat: 33.7739, lng: -117.9414, state: 'ca' },
    'gardena': { lat: 33.8883, lng: -118.3090, state: 'ca' },
    'gilroy': { lat: 37.0058, lng: -121.5683, state: 'ca' },
    'glendora': { lat: 34.1361, lng: -117.8653, state: 'ca' },
    'grand junction': { lat: 39.0639, lng: -108.5506, state: 'co' },
    'hanford': { lat: 36.3274, lng: -119.6457, state: 'ca' },
    'hawthorne': { lat: 33.9164, lng: -118.3526, state: 'ca' },
    'hayward': { lat: 37.6688, lng: -122.0808, state: 'ca' },
    'hemet': { lat: 33.7476, lng: -116.9719, state: 'ca' },
    'hesperia': { lat: 34.4264, lng: -117.3009, state: 'ca' },
    'highland': { lat: 34.1283, lng: -117.2086, state: 'ca' },
    'huntington beach': { lat: 33.6595, lng: -117.9988, state: 'ca' },
    'huntington park': { lat: 33.9817, lng: -118.2251, state: 'ca' },
    'indio': { lat: 33.7206, lng: -116.2156, state: 'ca' },
    'inglewood': { lat: 33.9617, lng: -118.3531, state: 'ca' },
    'jurupa valley': { lat: 33.9972, lng: -117.4855, state: 'ca' },
    'la habra': { lat: 33.9319, lng: -117.9462, state: 'ca' },
    'la mesa': { lat: 32.7678, lng: -117.0231, state: 'ca' },
    'la mirada': { lat: 33.9172, lng: -118.0120, state: 'ca' },
    'la quinta': { lat: 33.6633, lng: -116.3100, state: 'ca' },
    'laguna niguel': { lat: 33.5225, lng: -117.7076, state: 'ca' },
    'lake elsinore': { lat: 33.6681, lng: -117.3273, state: 'ca' },
    'lake forest': { lat: 33.6469, lng: -117.6891, state: 'ca' },
    'lakewood': { lat: 33.8536, lng: -118.1340, state: 'ca' },
    'lancaster': { lat: 34.6868, lng: -118.1542, state: 'ca' },
    'livermore': { lat: 37.6819, lng: -121.7680, state: 'ca' },
    'lodi': { lat: 38.1302, lng: -121.2724, state: 'ca' },
    'lompoc': { lat: 34.6392, lng: -120.4579, state: 'ca' },
    'lynwood': { lat: 33.9303, lng: -118.2115, state: 'ca' },
    'madera': { lat: 36.9613, lng: -120.0607, state: 'ca' },
    'manteca': { lat: 37.7974, lng: -121.2161, state: 'ca' },
    'menifee': { lat: 33.6971, lng: -117.1850, state: 'ca' },
    'merced': { lat: 37.3022, lng: -120.4830, state: 'ca' },
    'milpitas': { lat: 37.4323, lng: -121.8996, state: 'ca' },
    'mission viejo': { lat: 33.6000, lng: -117.6720, state: 'ca' },
    'modesto': { lat: 37.6391, lng: -120.9969, state: 'ca' },
    'montebello': { lat: 34.0165, lng: -118.1138, state: 'ca' },
    'monterey park': { lat: 34.0625, lng: -118.1228, state: 'ca' },
    'moreno valley': { lat: 33.9425, lng: -117.2297, state: 'ca' },
    'mountain view': { lat: 37.3861, lng: -122.0839, state: 'ca' },
    'murrieta': { lat: 33.5539, lng: -117.2139, state: 'ca' },
    'napa': { lat: 38.2975, lng: -122.2869, state: 'ca' },
    'national city': { lat: 32.6781, lng: -117.0992, state: 'ca' },
    'newark ca': { lat: 37.5297, lng: -122.0402, state: 'ca' },
    'newport beach': { lat: 33.6189, lng: -117.9289, state: 'ca' },
    'norwalk': { lat: 33.9022, lng: -118.0817, state: 'ca' },
    'novato': { lat: 38.1074, lng: -122.5697, state: 'ca' },
    'oceanside': { lat: 33.1959, lng: -117.3795, state: 'ca' },
    'ontario': { lat: 34.0633, lng: -117.6509, state: 'ca' },
    'orange': { lat: 33.7879, lng: -117.8531, state: 'ca' },
    'oxnard': { lat: 34.1975, lng: -119.1771, state: 'ca' },
    'palm desert': { lat: 33.7222, lng: -116.3744, state: 'ca' },
    'palm springs': { lat: 33.8303, lng: -116.5453, state: 'ca' },
    'palmdale': { lat: 34.5794, lng: -118.1165, state: 'ca' },
    'palo alto': { lat: 37.4419, lng: -122.1430, state: 'ca' },
    'paramount': { lat: 33.8894, lng: -118.1597, state: 'ca' },
    'pasadena': { lat: 34.1478, lng: -118.1445, state: 'ca' },
    'perris': { lat: 33.7825, lng: -117.2286, state: 'ca' },
    'petaluma': { lat: 38.2324, lng: -122.6367, state: 'ca' },
    'pico rivera': { lat: 33.9831, lng: -118.0967, state: 'ca' },
    'pittsburg': { lat: 38.0280, lng: -121.8847, state: 'ca' },
    'pleasanton': { lat: 37.6624, lng: -121.8747, state: 'ca' },
    'pomona': { lat: 34.0551, lng: -117.7500, state: 'ca' },
    'porterville': { lat: 36.0652, lng: -119.0168, state: 'ca' },
    'poway': { lat: 32.9628, lng: -117.0359, state: 'ca' },
    'rancho cordova': { lat: 38.5891, lng: -121.3028, state: 'ca' },
    'rancho cucamonga': { lat: 34.1064, lng: -117.5931, state: 'ca' },
    'rancho santa margarita': { lat: 33.6406, lng: -117.6031, state: 'ca' },
    'redding': { lat: 40.5865, lng: -122.3917, state: 'ca' },
    'redlands': { lat: 34.0556, lng: -117.1825, state: 'ca' },
    'redondo beach': { lat: 33.8492, lng: -118.3884, state: 'ca' },
    'redwood city': { lat: 37.4852, lng: -122.2364, state: 'ca' },
    'rocklin': { lat: 38.7907, lng: -121.2358, state: 'ca' },
    'rosemead': { lat: 34.0806, lng: -118.0728, state: 'ca' },
    'roseville': { lat: 38.7521, lng: -121.2880, state: 'ca' },
    'salinas': { lat: 36.6777, lng: -121.6555, state: 'ca' },
    'san bruno': { lat: 37.6305, lng: -122.4111, state: 'ca' },
    'san buenaventura': { lat: 34.2746, lng: -119.2290, state: 'ca' },
    'san clemente': { lat: 33.4270, lng: -117.6120, state: 'ca' },
    'san jacinto': { lat: 33.7839, lng: -116.9586, state: 'ca' },
    'san leandro': { lat: 37.7249, lng: -122.1561, state: 'ca' },
    'san luis obispo': { lat: 35.2828, lng: -120.6596, state: 'ca' },
    'san marcos': { lat: 33.1434, lng: -117.1661, state: 'ca' },
    'san mateo': { lat: 37.5630, lng: -122.3255, state: 'ca' },
    'san rafael': { lat: 37.9735, lng: -122.5311, state: 'ca' },
    'san ramon': { lat: 37.7799, lng: -121.9780, state: 'ca' },
    'santa barbara': { lat: 34.4208, lng: -119.6982, state: 'ca' },
    'santa clara': { lat: 37.3541, lng: -121.9552, state: 'ca' },
    'santa cruz': { lat: 36.9741, lng: -122.0308, state: 'ca' },
    'santa maria': { lat: 34.9530, lng: -120.4357, state: 'ca' },
    'santa monica': { lat: 34.0195, lng: -118.4912, state: 'ca' },
    'santa rosa': { lat: 38.4404, lng: -122.7141, state: 'ca' },
    'santee': { lat: 32.8384, lng: -116.9739, state: 'ca' },
    'simi valley': { lat: 34.2694, lng: -118.7815, state: 'ca' },
    'south gate': { lat: 33.9547, lng: -118.2120, state: 'ca' },
    'south san francisco': { lat: 37.6547, lng: -122.4077, state: 'ca' },
    'sunnyvale': { lat: 37.3688, lng: -122.0363, state: 'ca' },
    'temecula': { lat: 33.4936, lng: -117.1484, state: 'ca' },
    'thousand oaks': { lat: 34.1706, lng: -118.8376, state: 'ca' },
    'torrance': { lat: 33.8358, lng: -118.3406, state: 'ca' },
    'tracy': { lat: 37.7397, lng: -121.4252, state: 'ca' },
    'tulare': { lat: 36.2077, lng: -119.3473, state: 'ca' },
    'turlock': { lat: 37.4947, lng: -120.8466, state: 'ca' },
    'tustin': { lat: 33.7458, lng: -117.8262, state: 'ca' },
    'union city': { lat: 37.5934, lng: -122.0439, state: 'ca' },
    'upland': { lat: 34.0975, lng: -117.6484, state: 'ca' },
    'vacaville': { lat: 38.3566, lng: -121.9877, state: 'ca' },
    'vallejo': { lat: 38.1041, lng: -122.2566, state: 'ca' },
    'ventura': { lat: 34.2746, lng: -119.2290, state: 'ca' },
    'victorville': { lat: 34.5362, lng: -117.2928, state: 'ca' },
    'visalia': { lat: 36.3302, lng: -119.2921, state: 'ca' },
    'vista': { lat: 33.2000, lng: -117.2425, state: 'ca' },
    'walnut creek': { lat: 37.9101, lng: -122.0652, state: 'ca' },
    'watsonville': { lat: 36.9103, lng: -121.7569, state: 'ca' },
    'west covina': { lat: 34.0686, lng: -117.9390, state: 'ca' },
    'west sacramento': { lat: 38.5805, lng: -121.5302, state: 'ca' },
    'westminster': { lat: 33.7513, lng: -117.9940, state: 'ca' },
    'whittier': { lat: 33.9792, lng: -118.0328, state: 'ca' },
    'woodland': { lat: 38.6785, lng: -121.7733, state: 'ca' },
    'yorba linda': { lat: 33.8886, lng: -117.8131, state: 'ca' },
    'yuba city': { lat: 39.1404, lng: -121.6169, state: 'ca' },
    'yucaipa': { lat: 34.0336, lng: -117.0431, state: 'ca' },
};

/**
 * Look up city coordinates with state-aware matching
 *
 * @param cityString - The city name, optionally with state (e.g., "Portland, OR")
 * @param stateHint - Optional state abbreviation to help disambiguate
 * @returns Coordinates or null if not found
 */
export function lookupCityCoordinates(
    cityString: string | undefined,
    stateHint?: string | null
): CityCoordinate | null {
    if (!cityString) return null;

    const normalized = cityString.toLowerCase().trim();

    // Parse city and state from the string
    const { city, state } = parseCityState(normalized);
    const effectiveState = stateHint?.toLowerCase() || state;

    // 1. Try exact match with state suffix (e.g., "portland me")
    if (effectiveState) {
        const withState = `${city} ${effectiveState}`;
        if (CITY_COORDINATES[withState]) {
            return CITY_COORDINATES[withState];
        }
    }

    // 2. Try exact match on city name
    if (CITY_COORDINATES[city]) {
        const match = CITY_COORDINATES[city];
        // If we have a state hint and it doesn't match, keep looking
        if (effectiveState && match.state && match.state !== effectiveState) {
            // Look for a state-specific entry
            const stateSpecific = `${city} ${effectiveState}`;
            if (CITY_COORDINATES[stateSpecific]) {
                return CITY_COORDINATES[stateSpecific];
            }
            // Check all entries for a matching city+state
            for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
                if (key.startsWith(city) && coords.state === effectiveState) {
                    return coords;
                }
            }
        }
        return match;
    }

    // 3. Try common variations
    const variations = [
        city.replace(/^st\.?\s+/i, 'saint '),
        city.replace(/^saint\s+/i, 'st '),
        city.replace(/^ft\.?\s+/i, 'fort '),
        city.replace(/^fort\s+/i, 'ft '),
        city.replace(/-/g, ' '),
        city.replace(/\s+/g, '-'),
    ];

    for (const variant of variations) {
        if (CITY_COORDINATES[variant]) {
            return CITY_COORDINATES[variant];
        }
        if (effectiveState) {
            const withState = `${variant} ${effectiveState}`;
            if (CITY_COORDINATES[withState]) {
                return CITY_COORDINATES[withState];
            }
        }
    }

    // 4. NO partial matching - this was causing the bugs!
    // Instead, return null and let the caller use geocoding API
    return null;
}

/**
 * Parse a city string into city name and state
 */
function parseCityState(input: string): { city: string; state: string | null } {
    // Common state abbreviations
    const stateAbbreviations = [
        'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
        'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
        'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
        'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
        'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy', 'dc'
    ];

    // Try "City, ST" format
    const commaMatch = input.match(/^(.+?),\s*([a-z]{2})$/i);
    if (commaMatch) {
        const potentialState = commaMatch[2].toLowerCase();
        if (stateAbbreviations.includes(potentialState)) {
            return { city: commaMatch[1].trim(), state: potentialState };
        }
    }

    // Try "City ST" format (space separated)
    const spaceMatch = input.match(/^(.+?)\s+([a-z]{2})$/i);
    if (spaceMatch) {
        const potentialState = spaceMatch[2].toLowerCase();
        if (stateAbbreviations.includes(potentialState)) {
            return { city: spaceMatch[1].trim(), state: potentialState };
        }
    }

    return { city: input, state: null };
}
