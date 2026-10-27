import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
} from 'lucide-react';

const ICON_MAP = {
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Compass,
};

export default function WeatherIcon({ name, className = 'w-6 h-6', animate = false }) {
  const IconComponent = ICON_MAP[name] || Sun;

  let animClass = '';
  if (animate) {
    if (name.includes('Sun')) animClass = 'animate-[spin_24s_linear_infinite]';
    else if (name.includes('Rain') || name.includes('Drizzle')) animClass = 'animate-bounce';
    else if (name.includes('Cloud')) animClass = 'animate-pulse';
  }

  return <IconComponent className={`${className} ${animClass}`} />;
}
