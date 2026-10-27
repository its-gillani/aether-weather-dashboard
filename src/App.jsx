import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CommandBar from './components/CommandBar';
import HeroCurrentCard from './components/HeroCurrentCard';
import HourlyTimelineCard from './components/HourlyTimelineCard';
import DailyForecastCard from './components/DailyForecastCard';
import TelemetryGrid from './components/TelemetryGrid';
import AtmosphericBackground from './components/AtmosphericBackground';
import CachedDataBanner from './components/CachedDataBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { fetchWeatherData, reverseGeocode } from './services/weatherApi';
import { getWeatherCondition } from './utils/weatherCodes';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_GLOBAL_HUB = {
  id: 1850147,
  name: 'Tokyo',
  latitude: 35.6895,
  longitude: 139.6917,
  admin1: 'Tokyo',
  country: 'Japan',
  countryCode: 'JP',
  elevation: 40,
  timezone: 'Asia/Tokyo',
};

const INITIAL_PINNED_CITIES = [
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    admin1: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7143,
    longitude: -74.006,
    admin1: 'New York',
    country: 'United States',
    countryCode: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    admin1: 'England',
    country: 'United Kingdom',
    countryCode: 'GB',
    timezone: 'Europe/London',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    admin1: 'Île-de-France',
    country: 'France',
    countryCode: 'FR',
    timezone: 'Europe/Paris',
  },
];

export default function App() {
  const [units, setUnits] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_units');
      return saved
        ? JSON.parse(saved)
        : { temp: 'C', wind: 'kmh', pressure: 'hPa', imperial: false };
    } catch {
      return { temp: 'C', wind: 'kmh', pressure: 'hPa', imperial: false };
    }
  });

  const [activeCity, setActiveCity] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_active_city');
      return saved ? JSON.parse(saved) : DEFAULT_GLOBAL_HUB;
    } catch {
      return DEFAULT_GLOBAL_HUB;
    }
  });

  const [pinnedCities, setPinnedCities] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_pinned_cities');
      return saved ? JSON.parse(saved) : INITIAL_PINNED_CITIES;
    } catch {
      return INITIAL_PINNED_CITIES;
    }
  });

  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const handleUpdateUnit = useCallback((key, value) => {
    setUnits((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('aether_units', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save units:', e);
      }
      return updated;
    });
  }, []);

  const handlePinCity = useCallback((city) => {
    if (!city) return;
    setPinnedCities((prev) => {
      if (prev.some((c) => c.latitude === city.latitude && c.longitude === city.longitude)) {
        return prev;
      }
      const updated = [
        ...prev,
        {
          id: city.id || Date.now(),
          name: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          admin1: city.admin1,
          country: city.country,
          countryCode: city.countryCode,
          timezone: city.timezone,
          currentTemp: weatherData?.current?.temperature_2m,
          weatherCode: weatherData?.current?.weather_code,
          iconName: getWeatherCondition(
            weatherData?.current?.weather_code,
            weatherData?.current?.is_day
          ).icon,
        },
      ].slice(-8);

      try {
        localStorage.setItem('aether_pinned_cities', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save pinned cities:', e);
      }
      return updated;
    });
  }, [weatherData]);

  const handleUnpinCity = useCallback((city) => {
    if (!city) return;
    setPinnedCities((prev) => {
      const updated = prev.filter(
        (c) => !(c.latitude === city.latitude && c.longitude === city.longitude)
      );
      try {
        localStorage.setItem('aether_pinned_cities', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save pinned cities:', e);
      }
      return updated;
    });
  }, []);

  const isCurrentPinned = useMemo(() => {
    if (!activeCity) return false;
    return pinnedCities.some(
      (c) => c.latitude === activeCity.latitude && c.longitude === activeCity.longitude
    );
  }, [activeCity, pinnedCities]);

  const handleSelectCity = useCallback((city) => {
    if (!city) return;
    setActiveCity(city);
    try {
      localStorage.setItem('aether_active_city', JSON.stringify(city));
    } catch (e) {
      console.warn('Failed to save active city:', e);
    }
  }, []);

  const loadWeatherData = useCallback(async (lat, lon, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      const data = await fetchWeatherData(lat, lon);
      setWeatherData(data);

      setPinnedCities((prev) =>
        prev.map((c) => {
          if (c.latitude === lat && c.longitude === lon) {
            return {
              ...c,
              currentTemp: data.current?.temperature_2m,
              weatherCode: data.current?.weather_code,
              iconName: getWeatherCondition(data.current?.weather_code, data.current?.is_day).icon,
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Weather data fetch failure:', err);
      setFetchError(err.message || 'Unable to retrieve meteorological telemetries.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleTriggerGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your current browser environment.');
      return;
    }

    setIsGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const loc = await reverseGeocode(latitude, longitude);
          handleSelectCity(loc);
        } catch (e) {
          console.warn('Reverse geocode failed:', e);
        } finally {
          setIsGeoLoading(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setIsGeoLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [handleSelectCity]);

  useEffect(() => {
    const storedCity = localStorage.getItem('aether_active_city');
    if (!storedCity && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            handleSelectCity(loc);
          } catch {
            loadWeatherData(activeCity.latitude, activeCity.longitude);
          }
        },
        () => {
          loadWeatherData(activeCity.latitude, activeCity.longitude);
        },
        { timeout: 6000 }
      );
    } else {
      loadWeatherData(activeCity.latitude, activeCity.longitude);
    }
  }, []);

  useEffect(() => {
    if (activeCity?.latitude !== undefined && activeCity?.longitude !== undefined) {
      loadWeatherData(activeCity.latitude, activeCity.longitude);
    }
  }, [activeCity?.latitude, activeCity?.longitude, loadWeatherData]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeCity) {
        loadWeatherData(activeCity.latitude, activeCity.longitude, true);
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeCity, loadWeatherData]);

  const activeCondition = useMemo(() => {
    if (!weatherData?.current) return { backdrop: 'clear-day' };
    return getWeatherCondition(
      weatherData.current.weather_code,
      weatherData.current.is_day
    );
  }, [weatherData?.current]);

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#070B14] transition-colors duration-1000">
        {/* Deep Obsidian Atmospheric Backdrop with Subtle Radial Ambient Mesh Glows */}
        <AtmosphericBackground backdrop={activeCondition.backdrop} />

        <div className="max-w-[1400px] w-full mx-auto space-y-5">
          {/* Top Command Bar & Favorites Ribbon */}
          <CommandBar
            currentCity={activeCity}
            pinnedCities={pinnedCities}
            onSelectCity={handleSelectCity}
            onPinCity={handlePinCity}
            onUnpinCity={handleUnpinCity}
            isPinned={isCurrentPinned}
            onTriggerGeo={handleTriggerGeolocation}
            isGeoLoading={isGeoLoading}
            units={units}
            onUpdateUnit={handleUpdateUnit}
          />

          {/* Cached / Offline Resilience Banner */}
          <CachedDataBanner
            isCached={weatherData?.isCached}
            cacheAgeMinutes={weatherData?.cacheAgeMinutes}
            errorWarning={weatherData?.errorWarning}
            onRefresh={() => loadWeatherData(activeCity.latitude, activeCity.longitude, true)}
            isRefreshing={isRefreshing}
          />

          {/* Loading Skeleton */}
          {isLoading ? (
            <div className="min-h-[520px] flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/65 border border-white/[0.08] backdrop-blur-2xl space-y-3">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              <div className="text-center">
                <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
                  Synchronizing Meteorological Telemetry...
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Querying Open-Meteo High-Resolution Mesh
                </p>
              </div>
            </div>
          ) : fetchError && !weatherData ? (
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-2xl text-center space-y-4 max-w-md mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-100">Telemetry Stream Interrupted</h3>
              <p className="text-xs text-slate-300">{fetchError}</p>
              <button
                type="button"
                onClick={() => loadWeatherData(activeCity.latitude, activeCity.longitude)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.1] hover:bg-white/[0.15] border border-white/[0.1] text-slate-100 font-medium text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          ) : (
            /* Equal Column Height Unified CSS Grid (items-stretch) */
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Column (4 cols): Hero Current Card + 7-Day Outlook */}
              <div className="lg:col-span-4 flex flex-col gap-5 items-stretch">
                <HeroCurrentCard
                  city={activeCity}
                  weather={weatherData}
                  units={units}
                  isPinned={isCurrentPinned}
                  onTogglePin={() =>
                    isCurrentPinned ? handleUnpinCity(activeCity) : handlePinCity(activeCity)
                  }
                />
                <DailyForecastCard weather={weatherData} units={units} />
              </div>

              {/* Right Column (8 cols): 24-Hour Timeline + 6-Card Telemetry Grid */}
              <div className="lg:col-span-8 flex flex-col gap-5 items-stretch">
                <HourlyTimelineCard weather={weatherData} units={units} />
                <TelemetryGrid weather={weatherData} units={units} />
              </div>
            </main>
          )}
        </div>

        {/* Minimalist Footnote */}
        <footer className="max-w-[1400px] w-full mx-auto mt-10 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open-Meteo High-Resolution Forecasting Core</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            AETHER METEOROLOGICAL INSTRUMENTATION • WMO COMPLIANT
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
