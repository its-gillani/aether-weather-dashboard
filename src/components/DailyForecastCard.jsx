import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, Sun, Wind } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { formatTemp, formatWind, formatPrecip } from '../utils/units';
import { getWeatherCondition } from '../utils/weatherCodes';

export default function DailyForecastCard({
  weather,
  units,
}) {
  const [expandedDayIndex, setExpandedDayIndex] = useState(null);

  const daily = weather?.daily || {};
  const current = weather?.current || {};
  const hourly = weather?.hourly || {};

  const days = useMemo(() => {
    if (!daily.time || !Array.isArray(daily.time)) return [];
    return daily.time.slice(0, 7).map((dateStr, idx) => {
      const date = new Date(dateStr + 'T00:00:00');
      const isToday = idx === 0;
      const dayName = isToday
        ? 'Today'
        : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

      const min = daily.temperature_2m_min?.[idx] ?? 0;
      const max = daily.temperature_2m_max?.[idx] ?? 0;
      const code = daily.weather_code?.[idx] ?? 0;
      const precipSum = daily.precipitation_sum?.[idx] ?? 0;
      const precipProb = daily.precipitation_probability_max?.[idx] ?? 0;
      const uvMax = daily.uv_index_max?.[idx] ?? 0;
      const gustMax = daily.wind_gusts_10m_max?.[idx] ?? 0;

      const dayHourStart = idx * 24;
      const morningTemp = hourly.temperature_2m?.[dayHourStart + 8] ?? min + (max - min) * 0.4;
      const afternoonTemp = hourly.temperature_2m?.[dayHourStart + 14] ?? max;
      const eveningTemp = hourly.temperature_2m?.[dayHourStart + 20] ?? min + (max - min) * 0.6;
      const nightTemp = hourly.temperature_2m?.[dayHourStart + 2] ?? min;

      return {
        idx,
        dateStr,
        dayName,
        isToday,
        min,
        max,
        code,
        precipSum,
        precipProb,
        uvMax,
        gustMax,
        breakdown: {
          morning: morningTemp,
          afternoon: afternoonTemp,
          evening: eveningTemp,
          night: nightTemp,
        },
      };
    });
  }, [daily, hourly]);

  const { weekMin, weekMax } = useMemo(() => {
    if (days.length === 0) return { weekMin: 0, weekMax: 1 };
    let min = Infinity;
    let max = -Infinity;
    days.forEach((d) => {
      if (d.min < min) min = d.min;
      if (d.max > max) max = d.max;
    });
    if (min === max) {
      min -= 1;
      max += 1;
    }
    return { weekMin: min, weekMax: max };
  }, [days]);

  const toggleDayExpansion = (idx) => {
    setExpandedDayIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="flex-1 flex flex-col justify-between rounded-2xl p-6 sm:p-7 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
      {/* Editorial Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            7-Day Synoptic Outlook
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Week Matrix</span>
      </div>

      {/* 7-Day Rows with Equal Vertical Distribution */}
      <div className="flex-1 flex flex-col justify-between space-y-1">
        {days.map((d) => {
          const condition = getWeatherCondition(d.code, 1);
          const isExpanded = expandedDayIndex === d.idx;

          // Apple Weather Range Bar Proportions
          const leftPercent = Math.max(0, ((d.min - weekMin) / (weekMax - weekMin)) * 100);
          const widthPercent = Math.max(5, ((d.max - d.min) / (weekMax - weekMin)) * 100);

          let currentTempDot = null;
          if (d.isToday && current.temperature_2m !== undefined) {
            const curVal = current.temperature_2m;
            currentTempDot = Math.min(
              100,
              Math.max(0, ((curVal - weekMin) / (weekMax - weekMin)) * 100)
            );
          }

          return (
            <div
              key={d.dateStr}
              className={`rounded-xl transition-colors border ${
                isExpanded ? 'bg-white/[0.04] border-white/[0.08]' : 'border-transparent hover:bg-white/[0.02]'
              }`}
            >
              {/* Strict CSS Grid Row: [52px_24px_36px_1fr_20px] */}
              <div
                onClick={() => toggleDayExpansion(d.idx)}
                className="grid grid-cols-[52px_24px_36px_1fr_20px] items-center gap-2.5 py-2.5 px-2 cursor-pointer select-none"
              >
                {/* Col 1: Day Label */}
                <span className={`text-sm font-medium ${d.isToday ? 'text-slate-50 font-semibold' : 'text-slate-300'}`}>
                  {d.dayName}
                </span>

                {/* Col 2: Weather Icon (18px) */}
                <div className="flex items-center justify-center">
                  <WeatherIcon name={condition.icon} className="w-[18px] h-[18px] text-slate-400" />
                </div>

                {/* Col 3: Precip Probability (>15%) */}
                <div className="text-[11px] font-mono tabular-nums text-center">
                  {d.precipProb >= 15 ? (
                    <span className="text-sky-400 font-medium">{d.precipProb}%</span>
                  ) : (
                    <span className="text-slate-700">—</span>
                  )}
                </div>

                {/* Col 4 (1fr - CRITICAL): Full-Width Range Bar Track */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs text-slate-400 w-7 text-right tabular-nums shrink-0">
                    {formatTemp(d.min, units.temp, false)}°
                  </span>

                  {/* Range Track */}
                  <div className="relative flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-visible">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />

                    {/* Current Temp Glowing Dot */}
                    {currentTempDot !== null && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border border-slate-900 shadow-[0_0_6px_#ffffff] -ml-1.25 z-10"
                        style={{ left: `${currentTempDot}%` }}
                      />
                    )}
                  </div>

                  <span className="text-xs text-slate-100 font-semibold w-7 tabular-nums shrink-0">
                    {formatTemp(d.max, units.temp, false)}°
                  </span>
                </div>

                {/* Col 5: Expansion Chevron */}
                <div className="flex items-center justify-end">
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-sky-400' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Inline Drawer */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-white/[0.05] space-y-2.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{condition.label}</span>
                    <span className="font-mono text-slate-300">
                      Precip: {formatPrecip(d.precipSum, units.imperial)}
                    </span>
                  </div>

                  {/* 4-Period Breakdown */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    {[
                      { label: 'Morning', val: d.breakdown.morning },
                      { label: 'Afternoon', val: d.breakdown.afternoon },
                      { label: 'Evening', val: d.breakdown.evening },
                      { label: 'Night', val: d.breakdown.night },
                    ].map((slot) => (
                      <div
                        key={slot.label}
                        className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                      >
                        <span className="text-[10px] uppercase text-slate-400 block tracking-wider">
                          {slot.label}
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-100 mt-0.5 block tabular-nums">
                          {formatTemp(slot.val, units.temp)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* UV & Gusts */}
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400 font-mono tabular-nums">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400/80" />
                      UV Max {d.uvMax.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-slate-400" />
                      Gusts {formatWind(d.gustMax, units.wind)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
