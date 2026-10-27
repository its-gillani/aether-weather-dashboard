/**
 * WMO Weather Code Lookup & Theme Mapping
 * Open-Meteo Weather Interpretation Codes (WW)
 */

export const WMO_CODES = {
  0: {
    day: { label: 'Clear Sky', icon: 'Sun', backdrop: 'clear-day' },
    night: { label: 'Clear Sky', icon: 'Moon', backdrop: 'clear-night' },
  },
  1: {
    day: { label: 'Mainly Clear', icon: 'SunMedium', backdrop: 'clear-day' },
    night: { label: 'Mainly Clear', icon: 'MoonStar', backdrop: 'clear-night' },
  },
  2: {
    day: { label: 'Partly Cloudy', icon: 'CloudSun', backdrop: 'cloudy-day' },
    night: { label: 'Partly Cloudy', icon: 'CloudMoon', backdrop: 'cloudy-night' },
  },
  3: {
    day: { label: 'Overcast', icon: 'Cloud', backdrop: 'overcast' },
    night: { label: 'Overcast', icon: 'Cloud', backdrop: 'overcast' },
  },
  45: {
    day: { label: 'Fog', icon: 'CloudFog', backdrop: 'fog' },
    night: { label: 'Fog', icon: 'CloudFog', backdrop: 'fog' },
  },
  48: {
    day: { label: 'Depositing Rime Fog', icon: 'CloudFog', backdrop: 'fog' },
    night: { label: 'Depositing Rime Fog', icon: 'CloudFog', backdrop: 'fog' },
  },
  51: {
    day: { label: 'Light Drizzle', icon: 'CloudDrizzle', backdrop: 'rain' },
    night: { label: 'Light Drizzle', icon: 'CloudDrizzle', backdrop: 'rain' },
  },
  53: {
    day: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', backdrop: 'rain' },
    night: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', backdrop: 'rain' },
  },
  55: {
    day: { label: 'Dense Drizzle', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Dense Drizzle', icon: 'CloudRain', backdrop: 'rain' },
  },
  56: {
    day: { label: 'Light Freezing Drizzle', icon: 'CloudSnow', backdrop: 'snow' },
    night: { label: 'Light Freezing Drizzle', icon: 'CloudSnow', backdrop: 'snow' },
  },
  57: {
    day: { label: 'Dense Freezing Drizzle', icon: 'CloudSnow', backdrop: 'snow' },
    night: { label: 'Dense Freezing Drizzle', icon: 'CloudSnow', backdrop: 'snow' },
  },
  61: {
    day: { label: 'Slight Rain', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Slight Rain', icon: 'CloudRain', backdrop: 'rain' },
  },
  63: {
    day: { label: 'Moderate Rain', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Moderate Rain', icon: 'CloudRain', backdrop: 'rain' },
  },
  65: {
    day: { label: 'Heavy Rain', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Heavy Rain', icon: 'CloudRain', backdrop: 'rain' },
  },
  66: {
    day: { label: 'Light Freezing Rain', icon: 'CloudSnow', backdrop: 'snow' },
    night: { label: 'Light Freezing Rain', icon: 'CloudSnow', backdrop: 'snow' },
  },
  67: {
    day: { label: 'Heavy Freezing Rain', icon: 'CloudSnow', backdrop: 'snow' },
    night: { label: 'Heavy Freezing Rain', icon: 'CloudSnow', backdrop: 'snow' },
  },
  71: {
    day: { label: 'Slight Snowfall', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Slight Snowfall', icon: 'Snowflake', backdrop: 'snow' },
  },
  73: {
    day: { label: 'Moderate Snowfall', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Moderate Snowfall', icon: 'Snowflake', backdrop: 'snow' },
  },
  75: {
    day: { label: 'Heavy Snowfall', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Heavy Snowfall', icon: 'Snowflake', backdrop: 'snow' },
  },
  77: {
    day: { label: 'Snow Grains', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Snow Grains', icon: 'Snowflake', backdrop: 'snow' },
  },
  80: {
    day: { label: 'Slight Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Slight Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
  },
  81: {
    day: { label: 'Moderate Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Moderate Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
  },
  82: {
    day: { label: 'Violent Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
    night: { label: 'Violent Rain Showers', icon: 'CloudRain', backdrop: 'rain' },
  },
  85: {
    day: { label: 'Slight Snow Showers', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Slight Snow Showers', icon: 'Snowflake', backdrop: 'snow' },
  },
  86: {
    day: { label: 'Heavy Snow Showers', icon: 'Snowflake', backdrop: 'snow' },
    night: { label: 'Heavy Snow Showers', icon: 'Snowflake', backdrop: 'snow' },
  },
  95: {
    day: { label: 'Thunderstorm', icon: 'CloudLightning', backdrop: 'thunderstorm' },
    night: { label: 'Thunderstorm', icon: 'CloudLightning', backdrop: 'thunderstorm' },
  },
  96: {
    day: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', backdrop: 'thunderstorm' },
    night: { label: 'Thunderstorm with Slight Hail', icon: 'CloudLightning', backdrop: 'thunderstorm' },
  },
  99: {
    day: { label: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning', backdrop: 'thunderstorm' },
    night: { label: 'Thunderstorm with Heavy Hail', icon: 'CloudLightning', backdrop: 'thunderstorm' },
  },
};

/**
 * Returns condition details with fallback
 */
export function getWeatherCondition(code, isDay = 1) {
  const entry = WMO_CODES[code] || WMO_CODES[0];
  const variant = (isDay === 1 || isDay === true) ? entry.day : entry.night;
  return {
    code: code ?? 0,
    label: variant.label,
    icon: variant.icon,
    backdrop: variant.backdrop,
  };
}

/**
 * Theme backdrops mapping for dynamic gradients and surface tints
 */
export const THEME_BACKDROPS = {
  'clear-day': {
    gradient: 'from-sky-500 via-blue-600 to-indigo-800',
    cardBg: 'bg-sky-950/20',
    borderColor: 'border-sky-300/20',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.25)',
  },
  'clear-night': {
    gradient: 'from-slate-950 via-indigo-950 to-slate-900',
    cardBg: 'bg-slate-900/40',
    borderColor: 'border-indigo-400/20',
    accent: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.25)',
    stars: true,
  },
  'cloudy-day': {
    gradient: 'from-slate-600 via-slate-700 to-zinc-800',
    cardBg: 'bg-slate-800/30',
    borderColor: 'border-slate-400/20',
    accent: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.2)',
  },
  'cloudy-night': {
    gradient: 'from-slate-950 via-slate-900 to-zinc-950',
    cardBg: 'bg-slate-900/40',
    borderColor: 'border-slate-500/20',
    accent: '#94a3b8',
    glow: 'rgba(148, 163, 184, 0.2)',
  },
  'overcast': {
    gradient: 'from-slate-600 via-slate-700 to-zinc-800',
    cardBg: 'bg-slate-800/35',
    borderColor: 'border-slate-400/20',
    accent: '#cbd5e1',
    glow: 'rgba(203, 213, 225, 0.15)',
  },
  'fog': {
    gradient: 'from-slate-700 via-zinc-800 to-slate-900',
    cardBg: 'bg-zinc-800/40',
    borderColor: 'border-zinc-500/20',
    accent: '#e2e8f0',
    glow: 'rgba(226, 232, 240, 0.15)',
  },
  'rain': {
    gradient: 'from-slate-800 via-cyan-950 to-slate-900',
    cardBg: 'bg-cyan-950/25',
    borderColor: 'border-cyan-400/20',
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.25)',
    rain: true,
  },
  'thunderstorm': {
    gradient: 'from-gray-950 via-purple-950 to-slate-900',
    cardBg: 'bg-purple-950/25',
    borderColor: 'border-purple-400/20',
    accent: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.3)',
    lightning: true,
  },
  'snow': {
    gradient: 'from-blue-200/20 via-slate-700 to-slate-900',
    cardBg: 'bg-blue-950/20',
    borderColor: 'border-blue-300/25',
    accent: '#93c5fd',
    glow: 'rgba(147, 197, 253, 0.25)',
    snow: true,
  },
};
