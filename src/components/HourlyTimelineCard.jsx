import React, { useState, useMemo, useRef } from 'react';
import {
  Thermometer,
  Wind,
  Sun,
  Navigation,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { formatTemp, formatWind } from '../utils/units';
import { getWeatherCondition } from '../utils/weatherCodes';
import { findCurrentHourIndex } from '../utils/meteorology';

export default function HourlyTimelineCard({
  weather,
  units,
}) {
  const [activeTab, setActiveTab] = useState('temp'); // 'temp' | 'wind' | 'uv'
  const [hoverIndex, setHoverIndex] = useState(null);
  const scrollContainerRef = useRef(null);

  const hourly = weather?.hourly || {};
  const current = weather?.current || {};

  // Find target city's starting hour index
  const startIndex = useMemo(() => {
    return findCurrentHourIndex(hourly.time, current.time, weather?.utcOffsetSeconds || 0);
  }, [hourly.time, current.time, weather?.utcOffsetSeconds]);

  // Extract 24-hour horizon
  const timelineData = useMemo(() => {
    if (!hourly.time || hourly.time.length === 0) return [];
    const points = [];
    const count = 24;

    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      if (idx >= hourly.time.length) break;

      const timeIso = hourly.time[idx];
      const hourStr = timeIso ? timeIso.split('T')[1]?.slice(0, 5) : `${i}:00`;
      const isNow = i === 0;

      points.push({
        index: i,
        absoluteIndex: idx,
        time: hourStr,
        isNow,
        temp: hourly.temperature_2m?.[idx] ?? 0,
        apparentTemp: hourly.apparent_temperature?.[idx] ?? 0,
        precipProb: hourly.precipitation_probability?.[idx] ?? 0,
        precipMm: hourly.precipitation?.[idx] ?? 0,
        windSpeed: hourly.wind_speed_10m?.[idx] ?? 0,
        windDir: hourly.wind_direction_10m?.[idx] ?? 0,
        uv: hourly.uv_index?.[idx] ?? 0,
        cloudCover: hourly.cloud_cover?.[idx] ?? 0,
        weatherCode: hourly.weather_code?.[idx] ?? 0,
        isDay: hourly.is_day?.[idx] ?? 1,
      });
    }
    return points;
  }, [hourly, startIndex]);

  // Strict column width for vertical lockstep: 64px per hour
  const colWidth = 64;
  const count = timelineData.length || 24;
  const svgWidth = count * colWidth;
  const svgHeight = 170;
  const padTop = 28;
  const padBottom = 32;
  const chartHeight = svgHeight - padTop - padBottom;

  // Compute min/max
  const metricValues = useMemo(() => {
    if (timelineData.length === 0) return { values: [], min: 0, max: 1 };
    let vals = [];
    if (activeTab === 'temp') vals = timelineData.map((d) => d.temp);
    else if (activeTab === 'wind') vals = timelineData.map((d) => d.windSpeed);
    else vals = timelineData.map((d) => d.uv);

    let min = Math.min(...vals);
    let max = Math.max(...vals);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const spread = max - min || 1;
    min -= spread * 0.18;
    max += spread * 0.18;
    return { values: vals, min, max };
  }, [timelineData, activeTab]);

  // Strict vertical lockstep coordinates: node X center = (i + 0.5) * colWidth
  const { pathD, areaD, pointCoordinates } = useMemo(() => {
    if (timelineData.length === 0) return { pathD: '', areaD: '', pointCoordinates: [] };

    const coords = timelineData.map((d, i) => {
      const val = metricValues.values[i];
      const norm = (val - metricValues.min) / (metricValues.max - metricValues.min);
      const x = i * colWidth + colWidth / 2;
      const y = padTop + (1 - norm) * chartHeight;
      return { x, y, data: d, colIndex: i };
    });

    if (coords.length < 2) return { pathD: '', areaD: '', pointCoordinates: coords };

    // Cubic Bezier interpolation
    let pD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      const prev = coords[i - 1] || current;
      const nextNext = coords[i + 2] || next;

      const cp1x = current.x + (next.x - prev.x) * 0.2;
      const cp1y = current.y + (next.y - prev.y) * 0.2;
      const cp2x = next.x - (nextNext.x - current.x) * 0.2;
      const cp2y = next.y - (nextNext.y - current.y) * 0.2;

      pD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }

    const baselineY = svgHeight - padBottom + 12;
    const aD = `${pD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;

    return { pathD: pD, areaD: aD, pointCoordinates: coords };
  }, [timelineData, metricValues, colWidth, chartHeight, padTop, padBottom, svgHeight]);

  const activePoint = hoverIndex !== null ? pointCoordinates[hoverIndex] : null;

  return (
    <div className="rounded-2xl p-6 sm:p-7 bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] flex flex-col justify-between">
      {/* Editorial Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            24-Hour Atmospheric Trajectory
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.06]">
          {[
            { id: 'temp', label: 'Temp & Precip', icon: Thermometer },
            { id: 'wind', label: 'Wind & Gusts', icon: Wind },
            { id: 'uv', label: 'UV & Clouds', icon: Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setHoverIndex(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'bg-white/[0.1] text-slate-50 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3 text-slate-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smooth Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto no-scrollbar pb-2 select-none"
      >
        <div
          className="relative"
          style={{ width: `${svgWidth}px` }}
        >
          {/* SVG Canvas for Curve, Grid, and Bars */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-40 overflow-visible cursor-crosshair"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="areaRefinedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="nowGuideGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Subtle Horizontal Reference Grid Lines */}
            <line
              x1="0"
              y1={padTop + chartHeight * 0.25}
              x2={svgWidth}
              y2={padTop + chartHeight * 0.25}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
            <line
              x1="0"
              y1={padTop + chartHeight * 0.75}
              x2={svgWidth}
              y2={padTop + chartHeight * 0.75}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />

            {/* Highlighted 'Now' Column Vertical Gradient Guide */}
            {pointCoordinates.length > 0 && (
              <line
                x1={pointCoordinates[0].x}
                y1={padTop - 8}
                x2={pointCoordinates[0].x}
                y2={svgHeight - padBottom + 10}
                stroke="url(#nowGuideGrad)"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            )}

            {/* Precipitation Bars (Locked exactly to x_i) */}
            {pointCoordinates.map((pt, i) => {
              const prob = pt.data.precipProb;
              if (!prob || prob <= 0) return null;
              const barHeight = (prob / 100) * 36;
              const barWidth = 14;
              const barY = svgHeight - padBottom - barHeight;

              return (
                <g key={`bar-${i}`}>
                  <rect
                    x={pt.x - barWidth / 2}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="2"
                    fill="rgba(56, 189, 248, 0.4)"
                  />
                  {prob >= 30 && (
                    <text
                      x={pt.x}
                      y={barY - 4}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="500"
                    >
                      {prob}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Translucent Area Gradient */}
            {areaD && <path d={areaD} fill="url(#areaRefinedGrad)" />}

            {/* High-Precision Bezier Curve */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Labels strictly centered on each node */}
            {pointCoordinates.map((pt, i) => {
              let label = '';
              if (activeTab === 'temp') label = `${Math.round(pt.data.temp)}°`;
              else if (activeTab === 'wind') label = `${Math.round(pt.data.windSpeed)}`;
              else label = `${pt.data.uv.toFixed(1)}`;

              const isHovered = hoverIndex === i;

              return (
                <g key={`val-${i}`}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4.5 : 2.5}
                    fill={isHovered ? '#38bdf8' : '#ffffff'}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    fill={isHovered ? '#38bdf8' : '#f8fafc'}
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Hover Scrubbing Crosshair & Dot */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padTop - 12}
                  x2={activePoint.x}
                  y2={svgHeight - padBottom + 12}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Floating Scrubbing Tooltip */}
          {activePoint && (
            <div
              className="absolute z-30 pointer-events-none transform -translate-x-1/2 -top-11 px-3 py-1 rounded-lg bg-slate-950/95 border border-white/[0.12] shadow-xl text-xs space-y-0.5 whitespace-nowrap"
              style={{ left: `${activePoint.x}px` }}
            >
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] tabular-nums">
                <span className="font-semibold text-slate-100">{activePoint.data.time}</span>
                {activePoint.data.isNow && <span className="text-sky-400 font-sans">• Now</span>}
                <span className="text-slate-500">|</span>
                <span>{formatTemp(activePoint.data.temp, units.temp)}</span>
                <span className="text-slate-400">({formatWind(activePoint.data.windSpeed, units.wind)})</span>
              </div>
            </div>
          )}

          {/* Strict Vertical Lockstep Column Strip: Exact same column width (64px) */}
          <div className="flex border-t border-white/[0.06] pt-3">
            {timelineData.map((d, i) => {
              const cond = getWeatherCondition(d.weatherCode, d.isDay);
              const isHovered = hoverIndex === i;

              return (
                <div
                  key={`col-${i}`}
                  style={{ width: `${colWidth}px` }}
                  onMouseEnter={() => setHoverIndex(i)}
                  className={`shrink-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer py-1 transition-colors ${
                    isHovered ? 'text-slate-50' : 'text-slate-400'
                  }`}
                >
                  {/* Timestamp */}
                  <span
                    className={`text-[11px] font-mono tabular-nums leading-none ${
                      d.isNow ? 'text-sky-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {d.isNow ? 'Now' : d.time}
                  </span>

                  {/* Weather Condition Icon */}
                  <WeatherIcon
                    name={cond.icon}
                    className={`w-4 h-4 transition-transform ${
                      isHovered ? 'text-sky-400 scale-110' : 'text-slate-400'
                    }`}
                  />

                  {/* Wind Direction Chevron rotated */}
                  <div
                    className="p-0.5"
                    style={{ transform: `rotate(${d.windDir}deg)` }}
                    title={`Wind direction: ${d.windDir}°`}
                  >
                    <Navigation className="w-2.5 h-2.5 text-slate-500 fill-slate-500/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
