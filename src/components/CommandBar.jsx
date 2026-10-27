import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Star,
  X,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Mountain,
} from 'lucide-react';
import { searchCities } from '../services/weatherApi';
import WeatherIcon from './WeatherIcon';
import { formatTemp } from '../utils/units';

export default function CommandBar({
  currentCity,
  pinnedCities = [],
  onSelectCity,
  onPinCity,
  onUnpinCity,
  isPinned,
  onTriggerGeo,
  isGeoLoading,
  units,
  onUpdateUnit,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const unitMenuRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    const abortController = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const list = await searchCities(query, abortController.signal);
        setResults(list);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (unitMenuRef.current && !unitMenuRef.current.contains(event.target)) {
        setIsUnitModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || results.length === 0) {
      if (e.key === 'Escape') setIsDropdownOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectCity(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectCity = (city) => {
    onSelectCity(city);
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <header className="relative z-30 mb-7 space-y-3.5">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Brand & Micro Tag */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-200">
              <Compass className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-50 flex items-center gap-2">
                AETHER
                <span className="text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                  PRECISION METEOROLOGY
                </span>
              </h1>
            </div>
          </div>

          {/* Mobile GPS Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={onTriggerGeo}
              disabled={isGeoLoading}
              className="p-2 rounded-xl bg-slate-900/60 border border-white/[0.08] text-slate-300"
              title="Locate via GPS"
            >
              {isGeoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Search Command Input */}
        <div ref={searchContainerRef} className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search global stations or coordinates..."
              className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-white/[0.2] focus:ring-1 focus:ring-white/[0.1] transition-all shadow-inner"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 w-3.5 h-3.5 text-slate-400 animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 px-1 py-0.5 text-[9px] text-slate-400 bg-white/[0.04] border border-white/[0.08] rounded font-mono hidden sm:inline-block">
                ESC
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 py-1.5 rounded-xl bg-slate-900/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-white/[0.06]">
                Matching Stations ({results.length})
              </div>
              <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                {results.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <li key={`${item.id}-${idx}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectCity(item)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-white/[0.08] text-slate-50'
                            : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="font-medium text-xs text-slate-100">{item.name}</span>
                            <span className="ml-2 text-[11px] text-slate-400">
                              {[item.admin1, item.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.elevation > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <Mountain className="w-3 h-3 text-slate-400" />
                              {item.elevation}m
                            </span>
                          )}
                          {item.countryCode && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                              {item.countryCode}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* GPS Button + Unit Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={onTriggerGeo}
            disabled={isGeoLoading}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-white/[0.06] border border-white/[0.08] text-xs text-slate-300 transition-colors disabled:opacity-50"
          >
            {isGeoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-slate-400" />}
            <span>Locate GPS</span>
          </button>

          {/* Unit Switcher */}
          <div ref={unitMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUnitModalOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-white/[0.06] border border-white/[0.08] text-xs text-slate-300 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>°{units.temp} • {units.wind}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUnitModalOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-68 p-3.5 rounded-xl bg-slate-900/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl z-50 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Units Configuration
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Temperature */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Temperature</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    {['C', 'F'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onUpdateUnit('temp', t)}
                        className={`py-1 text-xs font-medium rounded transition-colors ${
                          units.temp === t
                            ? 'bg-white/[0.12] text-slate-50 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        °{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wind */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Wind Velocity</label>
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    {[
                      { id: 'kmh', label: 'km/h' },
                      { id: 'mph', label: 'mph' },
                      { id: 'ms', label: 'm/s' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => onUpdateUnit('wind', w.id)}
                        className={`py-1 text-xs font-medium rounded transition-colors ${
                          units.wind === w.id
                            ? 'bg-white/[0.12] text-slate-50 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pressure */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Atmospheric Pressure</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    {['hPa', 'inHg'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onUpdateUnit('pressure', p)}
                        className={`py-1 text-xs font-medium rounded transition-colors ${
                          units.pressure === p
                            ? 'bg-white/[0.12] text-slate-50 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance/Precip */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Precipitation & Range</label>
                  <div className="grid grid-cols-2 gap-1 p-0.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    {[
                      { id: false, label: 'Metric (mm, km)' },
                      { id: true, label: 'Imperial (in, mi)' },
                    ].map((sys) => (
                      <button
                        key={String(sys.id)}
                        type="button"
                        onClick={() => onUpdateUnit('imperial', sys.id)}
                        className={`py-1 text-[11px] font-medium rounded transition-colors ${
                          units.imperial === sys.id
                            ? 'bg-white/[0.12] text-slate-50 font-semibold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sys.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Stations Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => (isPinned ? onUnpinCity(currentCity) : onPinCity(currentCity))}
          className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
            isPinned
              ? 'bg-amber-400/[0.1] border-amber-400/30 text-amber-300'
              : 'bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span>{isPinned ? 'Pinned' : 'Pin Active Station'}</span>
        </button>

        {pinnedCities.map((city) => {
          const isActive = currentCity?.latitude === city.latitude && currentCity?.longitude === city.longitude;
          return (
            <div
              key={`${city.latitude}-${city.longitude}`}
              className={`shrink-0 flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg border transition-colors text-xs ${
                isActive
                  ? 'bg-white/[0.08] border-white/[0.18] text-slate-50 font-medium'
                  : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:text-slate-100 hover:bg-white/[0.04]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectCity(city)}
                className="flex items-center gap-1.5"
              >
                {city.currentTemp !== undefined && (
                  <span className="font-mono text-slate-200 tabular-nums">
                    {formatTemp(city.currentTemp, units.temp)}
                  </span>
                )}
                <span>{city.name}</span>
                {city.weatherCode !== undefined && (
                  <WeatherIcon name={city.iconName || 'Sun'} className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnpinCity(city);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-white"
                title="Remove pinned station"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </header>
  );
}
