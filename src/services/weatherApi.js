/**
 * Open-Meteo Data Layer & Resilient API Client
 * Features:
 * - 8-second request timeout via AbortController
 * - Non-blocking concurrent requests via Promise.allSettled
 * - LocalStorage caching with 10-minute TTL and offline fallback
 */

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const REQUEST_TIMEOUT_MS = 8000; // 8 seconds

/**
 * Robust fetch wrapper with timeout
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Allow external signal to also cancel
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 8 seconds');
    }
    throw error;
  }
}

/**
 * Cache helpers
 */
function getCacheKey(lat, lon) {
  return `aether_cache_${Number(lat).toFixed(2)}_${Number(lon).toFixed(2)}`;
}

export function getCachedWeather(lat, lon) {
  try {
    const key = getCacheKey(lat, lon);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const age = Date.now() - parsed.timestamp;
    return {
      ...parsed.data,
      isCached: true,
      cachedAt: parsed.timestamp,
      cacheAgeMinutes: Math.floor(age / 60000),
      isExpired: age > CACHE_TTL_MS,
    };
  } catch (err) {
    console.warn('Failed to read from localStorage cache:', err);
    return null;
  }
}

export function setCachedWeather(lat, lon, data) {
  try {
    const key = getCacheKey(lat, lon);
    const payload = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save to localStorage cache:', err);
  }
}

/**
 * A. City Search & Autocomplete (Geocoding API)
 */
export async function searchCities(query, signal) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=8&language=en&format=json`;

  try {
    const json = await fetchWithTimeout(url, { signal }, 5000);
    if (!json || !json.results) return [];

    return json.results.map((item) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      admin1: item.admin1 || '',
      country: item.country || '',
      countryCode: item.country_code || '',
      elevation: item.elevation || 0,
      timezone: item.timezone || 'UTC',
    }));
  } catch (err) {
    if (err.name === 'AbortError') return [];
    console.warn('City geocoding search failed:', err.message);
    return [];
  }
}

/**
 * Reverse Geocode Coordinates to Nearest City
 */
export async function reverseGeocode(lat, lon) {
  try {
    // Open-Meteo reverse geocoding fallback via closest search or BigDataCloud / open geocode
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(1)},${lon.toFixed(1)}&count=1&language=en&format=json`;
    const data = await fetchWithTimeout(url, {}, 5000);
    if (data?.results?.[0]) {
      return data.results[0];
    }
  } catch (e) {
    // Graceful fallback
  }

  return {
    name: 'Current Location',
    latitude: lat,
    longitude: lon,
    admin1: '',
    country: '',
    countryCode: 'GPS',
    elevation: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
  };
}

/**
 * B & C. Core Weather Forecast + Air Quality
 * Fetches concurrently using Promise.allSettled and falls back to cache
 */
export async function fetchWeatherData(lat, lon) {
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,visibility,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,dew_point_2m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=auto&forecast_days=7`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index&hourly=pm2_5,us_aqi&timezone=auto&forecast_days=1`;

  // Check cache first for rapid fallback if offline
  const cachedData = getCachedWeather(lat, lon);

  try {
    // Concurrent non-blocking requests
    const [forecastRes, aqiRes] = await Promise.allSettled([
      fetchWithTimeout(forecastUrl),
      fetchWithTimeout(aqiUrl),
    ]);

    if (forecastRes.status === 'rejected') {
      if (cachedData) {
        console.warn('Forecast API failed, returning cached data:', forecastRes.reason);
        return {
          ...cachedData,
          isCached: true,
          errorWarning: 'Network request failed. Viewing cached telemetry.',
        };
      }
      throw new Error(`Forecast request failed: ${forecastRes.reason?.message || 'Network error'}`);
    }

    const forecastData = forecastRes.value;
    const aqiData = aqiRes.status === 'fulfilled' ? aqiRes.value : (cachedData?.airQuality || null);

    // Normalize payload
    const normalized = {
      latitude: forecastData.latitude,
      longitude: forecastData.longitude,
      utcOffsetSeconds: forecastData.utc_offset_seconds || 0,
      timezone: forecastData.timezone || 'UTC',
      current: forecastData.current || {},
      hourly: forecastData.hourly || {},
      daily: forecastData.daily || {},
      airQuality: aqiData ? {
        current: aqiData.current || {},
        hourly: aqiData.hourly || {},
      } : null,
      fetchedAt: Date.now(),
      isCached: false,
    };

    // Save to cache
    setCachedWeather(lat, lon, normalized);

    return normalized;
  } catch (err) {
    if (cachedData) {
      return {
        ...cachedData,
        isCached: true,
        errorWarning: 'Offline mode: displaying cached telemetry.',
      };
    }
    throw err;
  }
}
