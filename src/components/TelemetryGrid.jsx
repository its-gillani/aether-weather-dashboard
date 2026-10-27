import React, { useMemo } from 'react';
import {
  formatWind,
  formatPressure,
  formatVisibility,
  formatTemp,
} from '../utils/units';
import {
  getAqiCategory,
  getUvCategory,
  getBeaufortScale,
  getDewPointComfort,
  calculatePressureTrend,
  calculateSolarArc,
  findCurrentHourIndex,
} from '../utils/meteorology';

export default function TelemetryGrid({
  weather,
  units,
}) {
  const current = weather?.current || {};
  const hourly = weather?.hourly || {};
  const daily = weather?.daily || {};
  const airQuality = weather?.airQuality || {};

  const currentHourIdx = useMemo(() => {
    return findCurrentHourIndex(hourly.time, current.time, weather?.utcOffsetSeconds || 0);
  }, [hourly.time, current.time, weather?.utcOffsetSeconds]);

  // 1. AQI & Pollutants
  const aqiVal = airQuality.current?.us_aqi ?? 28;
  const aqiInfo = getAqiCategory(aqiVal);
  const pm25 = airQuality.current?.pm2_5 ?? 8.4;
  const pm10 = airQuality.current?.pm10 ?? 14.2;

  // 2. Solar Arc & UV
  const sunriseIso = daily.sunrise?.[0];
  const sunsetIso = daily.sunset?.[0];
  const currentTimeStr = current.time || '';
  const solarArc = calculateSolarArc(sunriseIso, sunsetIso, currentTimeStr, current.is_day);
  const currentUv = hourly.uv_index?.[currentHourIdx] ?? daily.uv_index_max?.[0] ?? 0;
  const uvCategory = getUvCategory(currentUv);

  // 3. Wind & Beaufort
  const windSpeedKmh = current.wind_speed_10m ?? 0;
  const windGustsKmh = current.wind_gusts_10m ?? 0;
  const windDirDeg = current.wind_direction_10m ?? 0;
  const beaufort = getBeaufortScale(windSpeedKmh);

  // 4. Moisture & Comfort
  const humidity = current.relative_humidity_2m ?? 50;
  const dewPoint = hourly.dew_point_2m?.[currentHourIdx] ?? (current.temperature_2m - (100 - humidity) / 5);
  const dewPointComfort = getDewPointComfort(dewPoint);

  // 5. Barometric Pressure & 3-Hour Trend
  const surfacePressure = current.surface_pressure ?? 1013.2;
  const past3hIdx = Math.max(0, currentHourIdx - 3);
  const pastPressure = hourly.surface_pressure?.[past3hIdx] ?? surfacePressure;
  const pressureTrend = calculatePressureTrend(surfacePressure, pastPressure);

  // 6. Visibility & Cloud Ceiling
  const visibilityMeters = hourly.visibility?.[currentHourIdx] ?? 10000;
  const cloudCover = current.cloud_cover ?? hourly.cloud_cover?.[currentHourIdx] ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* ========================================================
          Card 1: AIR QUALITY
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            AIR QUALITY
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0">
            US AQI {aqiVal}
          </span>
        </div>

        {/* Center: Refined 4px Thin-Stroke Arc */}
        <div className="flex-1 flex items-center justify-between px-1">
          <div className="relative w-28 h-20 flex items-center justify-center">
            <svg viewBox="0 0 120 70" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 15 65 A 45 45 0 0 1 105 65"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Active Indicator Arc */}
              <path
                d="M 15 65 A 45 45 0 0 1 105 65"
                fill="none"
                stroke={aqiInfo.color}
                strokeWidth="4"
                strokeDasharray="141.4"
                strokeDashoffset={141.4 - (Math.min(aqiVal, 300) / 300) * 141.4}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute bottom-1 text-center">
              <span className="text-2xl font-light font-mono text-slate-50 tabular-nums block leading-none">
                {aqiVal}
              </span>
            </div>
          </div>

          {/* Right Metrics & Inline Status Dot */}
          <div className="space-y-2 flex-1 pl-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: aqiInfo.color }}
              />
              <span className="truncate">{aqiInfo.category}</span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>PM2.5</span>
                <span className="text-slate-300 tabular-nums">{pm25.toFixed(1)} μg/m³</span>
              </div>
              <div className="flex justify-between">
                <span>PM10</span>
                <span className="text-slate-300 tabular-nums">{pm10.toFixed(1)} μg/m³</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 truncate">
          {aqiInfo.advice}
        </div>
      </div>

      {/* ========================================================
          Card 2: SOLAR HORIZON
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            SOLAR HORIZON
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0">
            UV {currentUv.toFixed(1)}
          </span>
        </div>

        {/* Center: Horizon Curve with Glowing Celestial Node */}
        <div className="flex-1 flex flex-col justify-center px-1">
          <div className="relative w-full h-16 flex items-center justify-center">
            <svg viewBox="0 0 180 60" className="w-full h-full overflow-visible">
              {/* Horizon baseline */}
              <line
                x1="10"
                y1="52"
                x2="170"
                y2="52"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Parabolic Celestial Arc */}
              <path
                d="M 20 52 Q 90 2 160 52"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
              />

              {/* Sun/Moon Node */}
              {(() => {
                const t = Math.min(Math.max(solarArc.progress, 0), 1);
                // B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2: P0=(20,52), P1=(90,2), P2=(160,52)
                const sx = Math.round(Math.pow(1 - t, 2) * 20 + 2 * (1 - t) * t * 90 + Math.pow(t, 2) * 160);
                const sy = Math.round(Math.pow(1 - t, 2) * 52 + 2 * (1 - t) * t * 2 + Math.pow(t, 2) * 52);

                return (
                  <g>
                    <circle
                      cx={sx}
                      cy={sy}
                      r="7"
                      fill={solarArc.isDaytime ? 'rgba(251, 191, 36, 0.25)' : 'rgba(129, 140, 248, 0.25)'}
                    />
                    <circle
                      cx={sx}
                      cy={sy}
                      r="3.5"
                      fill={solarArc.isDaytime ? '#f59e0b' : '#818cf8'}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  </g>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1 tabular-nums">
            <span>Rise {solarArc.formattedSunrise}</span>
            <span>Set {solarArc.formattedSunset}</span>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
          <span className="truncate">{solarArc.daylightText}</span>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">{uvCategory.level}</span>
        </div>
      </div>

      {/* ========================================================
          Card 3: WIND DYNAMICS
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            WIND DYNAMICS
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
            {windDirDeg}°
          </span>
        </div>

        {/* Center: Minimalist Hairline Compass Ring */}
        <div className="flex-1 flex items-center justify-between px-2">
          <div className="relative w-20 h-20 rounded-full border border-white/[0.12] bg-white/[0.02] flex items-center justify-center">
            {/* Cardinal Micro-Labels */}
            <span className="absolute top-1 text-[8px] font-mono text-rose-400 font-bold">N</span>
            <span className="absolute right-1 text-[8px] font-mono text-slate-400">E</span>
            <span className="absolute bottom-1 text-[8px] font-mono text-slate-400">S</span>
            <span className="absolute left-1 text-[8px] font-mono text-slate-400">W</span>

            {/* Precision Hairline Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${windDirDeg}deg)` }}
            >
              <div className="w-0.5 h-14 bg-gradient-to-b from-sky-400 via-white to-slate-600 rounded-full" />
            </div>

            {/* Center Pivot Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-white/[0.3] z-10" />
          </div>

          {/* Velocity Breakdown */}
          <div className="space-y-1.5 pl-4 flex-1">
            <div className="flex items-baseline">
              <span className="text-3xl font-light font-mono text-slate-50 tabular-nums">
                {formatWind(windSpeedKmh, units.wind).split(' ')[0]}
              </span>
              <span className="text-xs text-slate-400 ml-1 font-mono">
                {formatWind(windSpeedKmh, units.wind).split(' ')[1]}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono tabular-nums">
              Gusts to {formatWind(windGustsKmh, units.wind)}
            </div>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
          <span className="truncate">{beaufort.label}</span>
          <span className="text-[11px] font-mono text-slate-400 shrink-0">Force {beaufort.scale}</span>
        </div>
      </div>

      {/* ========================================================
          Card 4: MOISTURE & COMFORT
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            MOISTURE & COMFORT
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
            {humidity}% RH
          </span>
        </div>

        {/* Center: Sleek Meter & Dew Point Readout */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-light font-mono text-slate-50 tabular-nums">
                {formatTemp(dewPoint, units.temp, false)}°
              </span>
              <span className="text-xs text-slate-400 ml-1.5 font-medium">Dew Point</span>
            </div>

            {/* Inline Status Dot */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dewPoint < 10
                    ? 'bg-cyan-400'
                    : dewPoint <= 16
                    ? 'bg-emerald-400'
                    : dewPoint <= 20
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span>{dewPointComfort.status}</span>
            </div>
          </div>

          {/* Horizontal Hairline Humidity Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, Math.max(4, humidity))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Dry</span>
              <span>Comfortable</span>
              <span>Humid</span>
            </div>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 truncate">
          {dewPointComfort.description}
        </div>
      </div>

      {/* ========================================================
          Card 5: BAROMETRIC PRESSURE (Refined Semicircular Dial)
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            BAROMETRIC PRESSURE
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0">MSL</span>
        </div>

        {/* Center: Precision Semicircular Dial with Calibrated Tick Marks */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 140 70" className="w-36 h-18 overflow-visible">
            {/* Outer Arc */}
            <path
              d="M 15 65 A 55 55 0 0 1 125 65"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="2"
            />

            {/* Calibrated Tick Marks: 980, 1000, 1013, 1025, 1040 hPa */}
            {[
              { val: 980, label: '980' },
              { val: 1000, label: '1000' },
              { val: 1013, label: '1013' },
              { val: 1025, label: '1025' },
              { val: 1040, label: '1040' },
            ].map((tick) => {
              // Pressure mapped 970 -> 180 deg, 1050 -> 0 deg
              const angleDeg = 180 - ((tick.val - 970) / (1050 - 970)) * 180;
              const angleRad = (angleDeg * Math.PI) / 180;
              const cx = 70;
              const cy = 65;
              const r1 = 51;
              const r2 = 57;
              const x1 = cx + r1 * Math.cos(angleRad);
              const y1 = cy - r1 * Math.sin(angleRad);
              const x2 = cx + r2 * Math.cos(angleRad);
              const y2 = cy - r2 * Math.sin(angleRad);

              return (
                <line
                  key={tick.val}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={tick.val === 1013 ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
                  strokeWidth={tick.val === 1013 ? '1.5' : '1'}
                />
              );
            })}

            {/* Needle */}
            {(() => {
              const p = Number(surfacePressure) || 1013.2;
              const angleDeg = 180 - Math.min(180, Math.max(0, ((p - 970) / (1050 - 970)) * 180));
              const angleRad = (angleDeg * Math.PI) / 180;
              const cx = 70;
              const cy = 65;
              const nx = cx + 45 * Math.cos(angleRad);
              const ny = cy - 45 * Math.sin(angleRad);

              return (
                <g>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={nx}
                    y2={ny}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
                </g>
              );
            })()}
          </svg>

          {/* Large Tabular Value */}
          <div className="text-center -mt-2">
            <span className="text-2xl font-light font-mono text-slate-50 tabular-nums">
              {formatPressure(surfacePressure, units.pressure).split(' ')[0]}
            </span>
            <span className="text-xs text-slate-400 ml-1 font-mono">
              {units.pressure}
            </span>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote with Status Dot */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                pressureTrend.trend.includes('rising')
                  ? 'bg-emerald-400'
                  : pressureTrend.trend.includes('falling')
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="truncate">{pressureTrend.label}</span>
          </div>
          <span className="font-mono text-slate-300 tabular-nums shrink-0">
            {pressureTrend.formattedDelta}
          </span>
        </div>
      </div>

      {/* ========================================================
          Card 6: OPTICAL VISIBILITY
         ======================================================== */}
      <div className="h-[235px] rounded-2xl p-5 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
        {/* Top: Locked Single-Line Header */}
        <div className="h-6 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 truncate">
            OPTICAL VISIBILITY
          </span>
          <span className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
            {cloudCover}% Clouds
          </span>
        </div>

        {/* Center: Range Value & Cloud Ceiling */}
        <div className="flex-1 flex flex-col justify-center space-y-3">
          <div>
            <span className="text-3xl font-light font-mono text-slate-50 tabular-nums">
              {formatVisibility(visibilityMeters, units.imperial).split(' ')[0]}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">
              {formatVisibility(visibilityMeters, units.imperial).split(' ')[1]} Range
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Cloud Ceiling</span>
              <span className="font-mono text-slate-300 tabular-nums">{cloudCover}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-1000"
                style={{ width: `${cloudCover}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom: 1-Line Footnote */}
        <div className="pt-2.5 border-t border-white/[0.06] text-xs text-slate-400 truncate">
          {visibilityMeters >= 10000
            ? 'Optimal line-of-sight visibility.'
            : 'Atmospheric moisture partially limits range.'}
        </div>
      </div>
    </div>
  );
}
