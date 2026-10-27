import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import WeatherHeroIllustration from './WeatherHeroIllustration';
import { formatTemp } from '../utils/units';
import { getTargetCityTime, generateSmartInsight } from '../utils/meteorology';
import { getWeatherCondition } from '../utils/weatherCodes';

export default function HeroCurrentCard({
  city,
  weather,
  units,
  isPinned,
  onTogglePin,
}) {
  const current = weather?.current || {};
  const daily = weather?.daily || {};
  const hourly = weather?.hourly || {};
  const condition = getWeatherCondition(current.weather_code, current.is_day);

  // Target city local ticking clock
  const [localTimeInfo, setLocalTimeInfo] = useState(() =>
    getTargetCityTime(weather?.utcOffsetSeconds || 0, weather?.timezone)
  );

  useEffect(() => {
    const updateTime = () => {
      setLocalTimeInfo(getTargetCityTime(weather?.utcOffsetSeconds || 0, weather?.timezone));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weather?.utcOffsetSeconds, weather?.timezone]);

  // Today's extremes
  const todayMax = daily.temperature_2m_max?.[0];
  const todayMin = daily.temperature_2m_min?.[0];

  // Smart natural language insight & feels-like reason
  const insightData = generateSmartInsight(
    hourly,
    0,
    current.temperature_2m,
    current.apparent_temperature
  );

  return (
    <div className="h-full rounded-2xl p-6 sm:p-7 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
      {/* Top Row: Station Title + Favorite Toggle & Muted Local Time */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-50 tracking-tight">
                {city?.name || 'Local Station'}
              </h2>
              <button
                type="button"
                onClick={onTogglePin}
                className="p-1 rounded-md hover:bg-white/[0.06] text-slate-400 hover:text-amber-400 transition-colors"
                title={isPinned ? 'Unpin city' : 'Pin city'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {[city?.admin1, city?.country].filter(Boolean).join(', ') || 'Atmospheric Station'}
            </p>
          </div>

          {/* Clean Muted Local Time (No Pill) */}
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium tabular-nums tracking-wide">
              {localTimeInfo.fullLabel}
            </span>
          </div>
        </div>

        {/* Middle Row: Tabular Temperature, Condition & Bespoke Weather Artwork */}
        <div className="mt-7 flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <span className="text-6xl sm:text-7xl font-light tracking-tighter text-slate-50 tabular-nums">
                {formatTemp(current.temperature_2m, units.temp, false)}
              </span>
              <span className="text-2xl sm:text-3xl text-slate-400 font-light ml-1">
                °{units.temp}
              </span>
            </div>

            <div className="mt-1 space-y-1">
              <span className="text-lg sm:text-xl font-medium text-slate-100 block">
                {condition.label}
              </span>

              {/* Clean Editorial Subtitle (Feels like • High • Low) */}
              <div className="text-xs text-slate-400 tabular-nums">
                <span>Feels like {formatTemp(current.apparent_temperature, units.temp)}</span>
                <span className="mx-2 text-slate-600">•</span>
                <span>
                  High {formatTemp(todayMax, units.temp)} &nbsp;Low {formatTemp(todayMin, units.temp)}
                </span>
              </div>
            </div>
          </div>

          {/* Bespoke Layered Multi-Tone Weather Vector Illustration */}
          <div className="shrink-0 pl-2">
            <WeatherHeroIllustration
              code={current.weather_code}
              isDay={current.is_day}
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Sleek Left-Bordered Callout */}
      <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2">
        <div className="border-l-2 border-sky-400/80 pl-3 py-0.5 text-xs text-slate-300 leading-relaxed">
          <p className="text-slate-200">
            {insightData.insight}
          </p>
          {insightData.feelsLikeReason && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              {insightData.feelsLikeReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
