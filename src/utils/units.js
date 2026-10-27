/**
 * Meteorological Unit Conversion Utilities
 * Client-side mathematical transforms for instantaneous unit toggles
 */

// Temperature
export function convertTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || Number.isNaN(Number(celsius))) {
    return '--';
  }
  const c = Number(celsius);
  if (unit === 'F') {
    return Math.round((c * 9) / 5 + 32);
  }
  return Math.round(c);
}

export function formatTemp(celsius, unit = 'C', includeSymbol = true) {
  const val = convertTemp(celsius, unit);
  if (val === '--') return '--';
  return includeSymbol ? `${val}°` : `${val}`;
}

// Wind Speed
export function convertWind(kmh, unit = 'kmh') {
  if (kmh === null || kmh === undefined || Number.isNaN(Number(kmh))) {
    return '--';
  }
  const val = Number(kmh);
  switch (unit) {
    case 'mph':
      return Math.round(val * 0.621371);
    case 'ms':
      return (val / 3.6).toFixed(1);
    case 'kmh':
    default:
      return Math.round(val);
  }
}

export function getWindUnitLabel(unit = 'kmh') {
  switch (unit) {
    case 'mph':
      return 'mph';
    case 'ms':
      return 'm/s';
    case 'kmh':
    default:
      return 'km/h';
  }
}

export function formatWind(kmh, unit = 'kmh') {
  const val = convertWind(kmh, unit);
  if (val === '--') return '--';
  return `${val} ${getWindUnitLabel(unit)}`;
}

// Pressure
export function convertPressure(hPa, unit = 'hPa') {
  if (hPa === null || hPa === undefined || Number.isNaN(Number(hPa))) {
    return '--';
  }
  const val = Number(hPa);
  if (unit === 'inHg') {
    return (val * 0.0295299830714).toFixed(2);
  }
  return Math.round(val);
}

export function getPressureUnitLabel(unit = 'hPa') {
  return unit === 'inHg' ? 'inHg' : 'hPa';
}

export function formatPressure(hPa, unit = 'hPa') {
  const val = convertPressure(hPa, unit);
  if (val === '--') return '--';
  return `${val} ${getPressureUnitLabel(unit)}`;
}

// Precipitation
export function convertPrecip(mm, isImperial = false) {
  if (mm === null || mm === undefined || Number.isNaN(Number(mm))) {
    return '0';
  }
  const val = Number(mm);
  if (isImperial) {
    return (val * 0.0393701).toFixed(2);
  }
  return val.toFixed(1);
}

export function formatPrecip(mm, isImperial = false) {
  const val = convertPrecip(mm, isImperial);
  return `${val} ${isImperial ? 'in' : 'mm'}`;
}

// Visibility (input in meters)
export function convertVisibility(meters, isImperial = false) {
  if (meters === null || meters === undefined || Number.isNaN(Number(meters))) {
    return '--';
  }
  const m = Number(meters);
  if (isImperial) {
    const miles = m * 0.000621371;
    return miles >= 10 ? Math.round(miles) : miles.toFixed(1);
  }
  const km = m / 1000;
  return km >= 10 ? Math.round(km) : km.toFixed(1);
}

export function formatVisibility(meters, isImperial = false) {
  const val = convertVisibility(meters, isImperial);
  if (val === '--') return '--';
  return `${val} ${isImperial ? 'mi' : 'km'}`;
}
