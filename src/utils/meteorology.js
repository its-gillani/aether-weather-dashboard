/**
 * Meteorological Science & Calculation Engine
 * High-precision algorithms for solar arcs, pressure deltas,
 * Beaufort scale, human thermal comfort, and natural-language synthesis.
 */

/**
 * Format target city's current local time string and UTC offset indicator
 */
export function getTargetCityTime(utcOffsetSeconds = 0, timeZone = null) {
  try {
    if (timeZone) {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now);

      const offsetHours = Math.floor(Math.abs(utcOffsetSeconds) / 3600);
      const offsetMinutes = Math.floor((Math.abs(utcOffsetSeconds) % 3600) / 60);
      const sign = utcOffsetSeconds >= 0 ? '+' : '-';
      const offsetStr = `UTC${sign}${offsetHours}${offsetMinutes > 0 ? `:${offsetMinutes}` : ''}`;

      return {
        formattedTime: timeStr,
        offsetStr,
        fullLabel: `Local Time: ${timeStr} • ${offsetStr}`,
      };
    }
  } catch (err) {
    // fallback to UTC offset arithmetic
  }

  // Pure mathematical epoch-offset calculation
  const epochNow = Date.now();
  const targetEpoch = epochNow + (utcOffsetSeconds * 1000);
  const targetDate = new Date(targetEpoch);
  const hours = String(targetDate.getUTCHours()).padStart(2, '0');
  const minutes = String(targetDate.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  const offsetHours = Math.floor(Math.abs(utcOffsetSeconds) / 3600);
  const sign = utcOffsetSeconds >= 0 ? '+' : '-';
  const offsetStr = `UTC${sign}${offsetHours}`;

  return {
    formattedTime: timeStr,
    offsetStr,
    fullLabel: `Local Time: ${timeStr} • ${offsetStr}`,
  };
}

/**
 * Locate current hour index in hourly array based on API current time or target city clock
 */
export function findCurrentHourIndex(hourlyTimes, currentTimeStr, utcOffsetSeconds = 0) {
  if (!hourlyTimes || !Array.isArray(hourlyTimes) || hourlyTimes.length === 0) return 0;
  
  if (currentTimeStr) {
    // Current time string usually in format 'YYYY-MM-DDTHH:MM'
    const targetHourPrefix = currentTimeStr.slice(0, 13);
    const index = hourlyTimes.findIndex(t => t.startsWith(targetHourPrefix));
    if (index !== -1) return index;
  }

  // Calculate from UTC offset
  const epochNow = Date.now();
  const targetEpoch = epochNow + (utcOffsetSeconds * 1000);
  const targetDate = new Date(targetEpoch);
  const yyyy = targetDate.getUTCFullYear();
  const mm = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getUTCDate()).padStart(2, '0');
  const hh = String(targetDate.getUTCHours()).padStart(2, '0');
  const targetIsoHour = `${yyyy}-${mm}-${dd}T${hh}:00`;

  const foundIndex = hourlyTimes.findIndex(t => t.startsWith(targetIsoHour));
  return foundIndex !== -1 ? foundIndex : 0;
}

/**
 * Beaufort Scale Classification
 */
export function getBeaufortScale(kmh = 0) {
  const speed = Number(kmh) || 0;
  if (speed < 1) return { scale: 0, label: 'Calm', description: 'Smoke rises vertically', color: '#94a3b8' };
  if (speed <= 5) return { scale: 1, label: 'Light Air', description: 'Smoke drift indicates wind direction', color: '#38bdf8' };
  if (speed <= 11) return { scale: 2, label: 'Light Breeze', description: 'Wind felt on exposed skin; leaves rustle', color: '#22d3ee' };
  if (speed <= 19) return { scale: 3, label: 'Gentle Breeze', description: 'Leaves and small twigs constantly move', color: '#34d399' };
  if (speed <= 28) return { scale: 4, label: 'Moderate Breeze', description: 'Dust and loose paper raised; small branches move', color: '#a3e635' };
  if (speed <= 38) return { scale: 5, label: 'Fresh Breeze', description: 'Small trees in leaf begin to sway', color: '#facc15' };
  if (speed <= 49) return { scale: 6, label: 'Strong Breeze', description: 'Large branches move; umbrellas used with difficulty', color: '#fb923c' };
  if (speed <= 61) return { scale: 7, label: 'Near Gale', description: 'Whole trees in motion; walking against wind is difficult', color: '#f87171' };
  if (speed <= 74) return { scale: 8, label: 'Gale', description: 'Twigs broken off trees; progress generally impeded', color: '#ef4444' };
  if (speed <= 88) return { scale: 9, label: 'Strong Gale', description: 'Slight structural damage occurs', color: '#dc2626' };
  if (speed <= 102) return { scale: 10, label: 'Storm', description: 'Trees uprooted; considerable structural damage', color: '#b91c1c' };
  if (speed <= 117) return { scale: 11, label: 'Violent Storm', description: 'Widespread structural damage', color: '#991b1b' };
  return { scale: 12, label: 'Hurricane Force', description: 'Devastation and catastrophic destruction', color: '#7f1d1d' };
}

/**
 * Dew Point & Thermal Comfort Classification
 */
export function getDewPointComfort(dewPointC = 12) {
  const dp = Number(dewPointC);
  if (dp < 10) {
    return {
      status: 'Dry & Crisp',
      description: 'Pleasantly dry air with low moisture',
      badgeColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/60',
    };
  }
  if (dp <= 15.5) {
    return {
      status: 'Comfortable',
      description: 'Optimal human thermal comfort balance',
      badgeColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60',
    };
  }
  if (dp <= 20) {
    return {
      status: 'Humid & Sticky',
      description: 'Moisture feels noticeable and heavy on skin',
      badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-800/60',
    };
  }
  return {
    status: 'Oppressive',
    description: 'Extremely muggy; severe perspiration difficulty',
    badgeColor: 'text-rose-300 bg-rose-950/60 border-rose-800/60',
  };
}

/**
 * 3-Hour Barometric Pressure Delta & Atmospheric Trend
 */
export function calculatePressureTrend(currentPressure, past3hPressure) {
  if (currentPressure === undefined || past3hPressure === undefined || past3hPressure === null) {
    return {
      delta: 0,
      formattedDelta: '±0.0',
      trend: 'steady',
      label: 'Steady',
      subtext: 'Atmospheric pressure is balanced',
      icon: 'Minus',
      color: 'text-slate-300',
    };
  }

  const delta = Number((currentPressure - past3hPressure).toFixed(1));
  const sign = delta > 0 ? '+' : '';
  const formattedDelta = `${sign}${delta} hPa`;

  if (delta >= 1.5) {
    return {
      delta,
      formattedDelta,
      trend: 'rising-rapid',
      label: 'Rising Rapidly',
      subtext: 'High pressure ridge • Rapid clearing',
      icon: 'TrendingUp',
      color: 'text-emerald-400',
    };
  }
  if (delta >= 0.5) {
    return {
      delta,
      formattedDelta,
      trend: 'rising',
      label: 'Rising',
      subtext: 'Improving conditions • Fair skies ahead',
      icon: 'ArrowUpRight',
      color: 'text-teal-400',
    };
  }
  if (delta <= -1.5) {
    return {
      delta,
      formattedDelta,
      trend: 'falling-rapid',
      label: 'Falling Rapidly',
      subtext: 'Deep front approaching • Storms likely',
      icon: 'TrendingDown',
      color: 'text-rose-400',
    };
  }
  if (delta <= -0.5) {
    return {
      delta,
      formattedDelta,
      trend: 'falling',
      label: 'Falling',
      subtext: 'Deteriorating weather • Increasing cloud cover',
      icon: 'ArrowDownRight',
      color: 'text-amber-400',
    };
  }
  return {
    delta,
    formattedDelta,
    trend: 'steady',
    label: 'Steady',
    subtext: 'Stable atmospheric equilibrium',
    icon: 'Minus',
    color: 'text-slate-300',
  };
}

/**
 * Solar Horizon Arc Calculation (Local City Time)
 */
export function calculateSolarArc(sunriseIso, sunsetIso, currentTimeStr, isDay = 1) {
  if (!sunriseIso || !sunsetIso) {
    return {
      progress: 0.5,
      isDaytime: Boolean(isDay),
      daylightText: 'Daylight data unavailable',
      formattedSunrise: '--:--',
      formattedSunset: '--:--',
      sunAngleDeg: 45,
    };
  }

  // Parse HH:MM from ISO strings
  const getMinutesFromMidnight = (isoStr) => {
    if (!isoStr) return 0;
    const parts = isoStr.split('T')[1]?.split(':') || ['0', '0'];
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const sunriseMin = getMinutesFromMidnight(sunriseIso);
  const sunsetMin = getMinutesFromMidnight(sunsetIso);

  const formattedSunrise = sunriseIso.split('T')[1]?.slice(0, 5) || '--:--';
  const formattedSunset = sunsetIso.split('T')[1]?.slice(0, 5) || '--:--';

  let currentMin = getMinutesFromMidnight(currentTimeStr);
  if (currentTimeStr && !currentTimeStr.includes('T')) {
    const parts = currentTimeStr.split(':');
    currentMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  const totalDaylightMin = sunsetMin - sunriseMin;
  const isDaytime = currentMin >= sunriseMin && currentMin < sunsetMin;

  let progress = 0;
  let daylightText = '';

  if (isDaytime) {
    progress = Math.min(Math.max((currentMin - sunriseMin) / totalDaylightMin, 0), 1);
    const leftMin = sunsetMin - currentMin;
    const leftHours = Math.floor(leftMin / 60);
    const leftMins = leftMin % 60;
    daylightText = `${leftHours}h ${leftMins}m of daylight remaining`;
  } else {
    // Night time
    if (currentMin >= sunsetMin) {
      // After sunset, before midnight
      const totalNightMin = (1440 - sunsetMin) + sunriseMin;
      const passedNightMin = currentMin - sunsetMin;
      progress = Math.min(Math.max(passedNightMin / totalNightMin, 0), 1);
      const toSunriseMin = (1440 - currentMin) + sunriseMin;
      const h = Math.floor(toSunriseMin / 60);
      const m = toSunriseMin % 60;
      daylightText = `Sunrise in ${h}h ${m}m`;
    } else {
      // After midnight, before sunrise
      const totalNightMin = (1440 - sunsetMin) + sunriseMin;
      const passedNightMin = (1440 - sunsetMin) + currentMin;
      progress = Math.min(Math.max(passedNightMin / totalNightMin, 0), 1);
      const toSunriseMin = sunriseMin - currentMin;
      const h = Math.floor(toSunriseMin / 60);
      const m = toSunriseMin % 60;
      daylightText = `Sunrise in ${h}h ${m}m`;
    }
  }

  // Arc Angle: 0 at sunrise (left horizon), 90 deg at zenith, 180 deg at sunset (right horizon)
  const sunAngleDeg = progress * 180;

  return {
    progress,
    isDaytime,
    daylightText,
    formattedSunrise,
    formattedSunset,
    sunAngleDeg,
    totalDaylightHours: (totalDaylightMin / 60).toFixed(1),
  };
}

/**
 * US AQI Categorization & Health Advisory
 */
export function getAqiCategory(aqi) {
  const val = Number(aqi) || 0;
  if (val <= 50) {
    return {
      category: 'Good',
      val,
      color: '#22c55e',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
      advice: 'Air quality is ideal for outdoor activities and exercise.',
      range: '0 - 50',
    };
  }
  if (val <= 100) {
    return {
      category: 'Moderate',
      val,
      color: '#eab308',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-500/30',
      advice: 'Air quality is acceptable. Exceptionally sensitive groups should consider reducing outdoor exertion.',
      range: '51 - 100',
    };
  }
  if (val <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      val,
      color: '#f97316',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-950/40',
      borderColor: 'border-orange-500/30',
      advice: 'Sensitive individuals with respiratory or heart conditions may experience irritations. Limit prolonged outdoor exposure.',
      range: '101 - 150',
    };
  }
  if (val <= 200) {
    return {
      category: 'Unhealthy',
      val,
      color: '#ef4444',
      textColor: 'text-rose-500',
      bgColor: 'bg-rose-950/40',
      borderColor: 'border-rose-500/30',
      advice: 'General public may begin to experience health effects. Wear an N95 mask outdoors.',
      range: '151 - 200',
    };
  }
  if (val <= 300) {
    return {
      category: 'Very Unhealthy',
      val,
      color: '#a855f7',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/30',
      advice: 'Health alert: Risk of serious effects increased for all residents. Avoid outdoor exertion.',
      range: '201 - 300',
    };
  }
  return {
    category: 'Hazardous',
    val,
    color: '#881337',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-950/80',
    borderColor: 'border-rose-600/50',
    advice: 'Emergency health warning: Entire population is likely to be affected. Keep all windows closed.',
    range: '301+',
  };
}

/**
 * UV Index Advice
 */
export function getUvCategory(uvIndex = 0) {
  const uv = Number(uvIndex) || 0;
  if (uv <= 2) {
    return {
      level: 'Low',
      uv,
      color: '#38bdf8',
      advice: 'Minimal sun protection needed. Safe for outdoor activities.',
    };
  }
  if (uv <= 5) {
    return {
      level: 'Moderate',
      uv,
      color: '#facc15',
      advice: 'Wear sunglasses and SPF 30+ sunscreen if outdoors for prolonged periods.',
    };
  }
  if (uv <= 7) {
    return {
      level: 'High',
      uv,
      color: '#fb923c',
      advice: 'Cover up, wear a wide-brim hat, and seek shade during midday hours.',
    };
  }
  if (uv <= 10) {
    return {
      level: 'Very High',
      uv,
      color: '#ef4444',
      advice: 'Avoid direct midday sun. Reapply SPF 50+ sunscreen every 2 hours.',
    };
  }
  return {
    level: 'Extreme',
    uv,
    color: '#c084fc',
    advice: 'Take all precautions. Unprotected skin can burn in minutes.',
  };
}

/**
 * Smart Natural-Language Insight Generator
 * Synthesizes next 12 hours of hourly weather dynamics
 */
export function generateSmartInsight(hourlyData, currentHourIndex = 0, currentTemp = 20, apparentTemp = 20) {
  if (!hourlyData || !hourlyData.time || hourlyData.time.length === 0) {
    return {
      insight: 'Atmospheric telemetry is stabilizing. Conditions expected to remain consistent over the next 12 hours.',
      feelsLikeReason: 'Feels consistent with actual air temperature.',
    };
  }

  // 1. Contextual Feels-Like Reason
  let feelsLikeReason = 'Consistent with actual temperature under standard humidity.';
  const tempDiff = apparentTemp - currentTemp;
  if (tempDiff <= -2) {
    feelsLikeReason = 'Wind chill and dry airflow make it feel noticeably cooler than measured.';
  } else if (tempDiff >= 2) {
    feelsLikeReason = 'Elevated relative humidity reduces evaporative cooling, making it feel warmer.';
  }

  // 2. Scan next 12 hours
  const endIndex = Math.min(currentHourIndex + 12, hourlyData.time.length);
  const next12Hours = {
    times: hourlyData.time.slice(currentHourIndex, endIndex),
    probs: (hourlyData.precipitation_probability || []).slice(currentHourIndex, endIndex),
    precip: (hourlyData.precipitation || []).slice(currentHourIndex, endIndex),
    winds: (hourlyData.wind_speed_10m || []).slice(currentHourIndex, endIndex),
    clouds: (hourlyData.cloud_cover || []).slice(currentHourIndex, endIndex),
    codes: (hourlyData.weather_code || []).slice(currentHourIndex, endIndex),
    temps: (hourlyData.temperature_2m || []).slice(currentHourIndex, endIndex),
  };

  // Check precipitation
  let maxPrecipProb = 0;
  let maxProbTime = '';
  let rainStartsHour = '';

  for (let i = 0; i < next12Hours.probs.length; i++) {
    const prob = next12Hours.probs[i] || 0;
    if (prob > maxPrecipProb) {
      maxPrecipProb = prob;
      const t = next12Hours.times[i];
      maxProbTime = t ? t.split('T')[1]?.slice(0, 5) : '';
    }
    if (prob >= 50 && !rainStartsHour) {
      const t = next12Hours.times[i];
      rainStartsHour = t ? t.split('T')[1]?.slice(0, 5) : '';
    }
  }

  // Check peak wind
  let maxWind = 0;
  for (const w of next12Hours.winds) {
    if (w > maxWind) maxWind = w;
  }

  // Check temperature shift
  const startT = next12Hours.temps[0] ?? currentTemp;
  const endT = next12Hours.temps[next12Hours.temps.length - 1] ?? currentTemp;
  const tempShift = Math.round(endT - startT);

  // Construct insight sentence
  let parts = [];

  if (maxPrecipProb >= 60) {
    parts.push(`Precipitation probability peaks at ${maxPrecipProb}% around ${maxProbTime || 'later'}.`);
  } else if (maxPrecipProb >= 30) {
    parts.push(`Passing showers possible with a ${maxPrecipProb}% chance near ${maxProbTime || 'this afternoon'}.`);
  } else {
    // Check cloud cover
    const avgCloud = next12Hours.clouds.reduce((a, b) => a + b, 0) / (next12Hours.clouds.length || 1);
    if (avgCloud < 20) {
      parts.push('Clear skies and unobstructed sunshine projected for the next 6 to 12 hours.');
    } else if (avgCloud < 60) {
      parts.push('Fair weather with intermittent scattered cloud cover through the forecast window.');
    } else {
      parts.push('Overcast cloud canopy will persist across the region over the coming hours.');
    }
  }

  if (maxWind >= 35) {
    parts.push(`Breezy intervals expected with gusts up to ${Math.round(maxWind)} km/h.`);
  }

  if (Math.abs(tempShift) >= 5) {
    if (tempShift < 0) {
      parts.push(`Temperatures will dip by ${Math.abs(tempShift)}° as evening approaches.`);
    } else {
      parts.push(`Noticeable warming trend of +${tempShift}° anticipated.`);
    }
  }

  return {
    insight: parts.join(' '),
    feelsLikeReason,
  };
}
