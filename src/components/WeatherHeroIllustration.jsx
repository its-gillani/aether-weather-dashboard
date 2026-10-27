import React from 'react';

/**
 * WeatherHeroIllustration
 * Bespoke, multi-tone SVG meteorological vector artwork.
 * Replaces generic scaled-up stroke icons with layered, dimensional weather art.
 */
export default function WeatherHeroIllustration({ code = 0, isDay = 1, className = 'w-28 h-28' }) {
  const isDaytime = Boolean(isDay);

  // Group weather code into atmospheric visual categories:
  // 'clear-day', 'clear-night', 'partly-day', 'partly-night', 'overcast', 'fog', 'rain', 'snow', 'thunderstorm'
  let visualType = 'clear-day';
  if (code === 0 || code === 1) {
    visualType = isDaytime ? 'clear-day' : 'clear-night';
  } else if (code === 2) {
    visualType = isDaytime ? 'partly-day' : 'partly-night';
  } else if (code === 3) {
    visualType = 'overcast';
  } else if (code === 45 || code === 48) {
    visualType = 'fog';
  } else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    visualType = 'rain';
  } else if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(code)) {
    visualType = 'snow';
  } else if ([95, 96, 99].includes(code)) {
    visualType = 'thunderstorm';
  }

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* 1. Clear Day: Radiant Sun with Corona Rings */}
      {visualType === 'clear-day' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sunCore" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="coronaBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          {/* Outer Pulsing Corona */}
          <circle cx="50" cy="50" r="42" fill="url(#sunGlow)" />
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.4"
            className="animate-[spin_40s_linear_infinite]"
          />

          {/* Soft Flare Aura */}
          <circle cx="50" cy="50" r="26" fill="#f59e0b" opacity="0.35" filter="url(#coronaBlur)" />

          {/* Solid Sun Core */}
          <circle cx="50" cy="50" r="20" fill="url(#sunCore)" />

          {/* Specular Highlight Arc */}
          <path
            d="M 38 40 A 15 15 0 0 1 56 34"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      )}

      {/* 2. Clear Night: Crescent Moon with Astral Aura */}
      {visualType === 'clear-night' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="moonBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="50" cy="50" r="38" fill="url(#moonGlow)" />

          {/* Twinkling Astral Dots */}
          <circle cx="22" cy="28" r="1.5" fill="#e0e7ff" opacity="0.7" className="animate-pulse" />
          <circle cx="74" cy="24" r="1.2" fill="#c7d2fe" opacity="0.9" />
          <circle cx="78" cy="68" r="1.5" fill="#e0e7ff" opacity="0.6" className="animate-pulse" />

          {/* Stylized Crescent Moon Path */}
          <path
            d="M 52 26 C 66 26 77 37 77 51 C 77 65 66 76 52 76 C 42 76 34 71 29 63 C 44 65 58 53 58 38 C 58 33 56 29 52 26 Z"
            fill="url(#moonBody)"
          />

          {/* Specular Highlight Rim */}
          <path
            d="M 54 28 C 65 30 73 39 74 50"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      )}

      {/* 3. Partly Cloudy Day: Sun Peeking Behind Layered Glass Clouds */}
      {visualType === 'partly-day' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="pSun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="cloudFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="cloudBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Sun Behind */}
          <circle cx="62" cy="38" r="16" fill="url(#pSun)" />
          <circle cx="62" cy="38" r="22" fill="#f59e0b" opacity="0.25" className="animate-pulse" />

          {/* Back Translucent Cloud */}
          <path
            d="M 38 52 C 38 46 43 41 49 41 C 53 41 57 43 59 47 C 62 46 66 48 68 51 C 71 52 74 56 74 60 C 74 65 70 69 65 69 L 38 69 C 32 69 28 65 28 59 C 28 54 32 50 37 50 Z"
            fill="url(#cloudBack)"
          />

          {/* Front Glassmorphic Cloud */}
          <path
            d="M 30 74 C 24 74 20 69 20 63 C 20 58 24 54 29 53 C 31 46 38 41 46 41 C 54 41 61 46 63 53 C 65 53 67 53 68 54 C 73 55 77 60 77 65 C 77 70 73 74 68 74 Z"
            fill="url(#cloudFront)"
          />

          {/* Specular Rim */}
          <path
            d="M 32 53 C 36 44 45 42 53 43 C 59 44 63 48 64 54"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      )}

      {/* 4. Partly Cloudy Night */}
      {visualType === 'partly-night' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="pMoon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <linearGradient id="nCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Moon Behind */}
          <path
            d="M 58 26 C 68 26 76 34 76 45 C 76 54 69 62 60 63 C 68 58 69 46 61 38 C 58 35 55 33 51 32 C 53 28 55 26 58 26 Z"
            fill="url(#pMoon)"
          />

          {/* Front Cloud */}
          <path
            d="M 28 72 C 22 72 18 67 18 62 C 18 57 22 53 27 52 C 29 45 36 41 44 41 C 52 41 58 46 60 52 C 62 52 64 52 65 53 C 70 54 74 58 74 63 C 74 68 70 72 65 72 Z"
            fill="url(#nCloud)"
          />
          <path
            d="M 30 52 C 34 44 43 42 51 43 C 56 44 59 48 60 53"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      )}

      {/* 5. Overcast: Deep Layered Storm & Stratus Silhouettes */}
      {visualType === 'overcast' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="cloudHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="cloudMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
          </defs>

          {/* Top Layer */}
          <path
            d="M 36 46 C 36 39 42 34 50 34 C 56 34 62 38 64 43 C 67 43 70 45 72 48 C 76 50 78 54 78 58 C 78 64 73 68 67 68 L 36 68 C 30 68 26 64 26 58 C 26 53 30 48 35 47 Z"
            fill="url(#cloudHigh)"
            opacity="0.6"
          />

          {/* Primary Layer */}
          <path
            d="M 26 70 C 20 70 16 65 16 59 C 16 54 20 50 25 49 C 27 42 34 38 42 38 C 50 38 57 43 59 49 C 61 49 63 49 64 50 C 69 51 73 55 73 60 C 73 65 69 70 64 70 Z"
            fill="url(#cloudMid)"
          />
          <path
            d="M 28 49 C 32 41 41 39 49 40 C 55 41 58 45 59 50"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      )}

      {/* 6. Fog / Mist: Horizontal Ambient Strata */}
      {visualType === 'fog' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="fogGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0" />
              <stop offset="20%" stopColor="#cbd5e1" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#cbd5e1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ghost Cloud Base */}
          <path
            d="M 32 48 C 32 42 37 38 44 38 C 50 38 55 42 57 47 C 60 47 64 50 65 54 C 65 59 61 63 56 63 L 30 63 C 25 63 22 59 22 55 C 22 51 25 48 30 48 Z"
            fill="#64748b"
            opacity="0.35"
          />

          {/* Precision Mist Strata */}
          <line x1="16" y1="52" x2="84" y2="52" stroke="url(#fogGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="60" x2="76" y2="60" stroke="url(#fogGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="18" y1="68" x2="82" y2="68" stroke="url(#fogGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="76" x2="72" y2="76" stroke="url(#fogGrad)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}

      {/* 7. Rain: Deep Oceanic Cloud with Slanted Glass Streaks */}
      {visualType === 'rain' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="rainCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="rainDrop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Cloud Base */}
          <path
            d="M 26 58 C 20 58 16 53 16 47 C 16 42 20 38 25 37 C 27 30 34 26 42 26 C 50 26 57 31 59 37 C 61 37 63 37 64 38 C 69 39 73 43 73 48 C 73 53 69 58 64 58 Z"
            fill="url(#rainCloud)"
          />
          <path
            d="M 28 37 C 32 29 41 27 49 28 C 55 29 58 33 59 38"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Angled Rain Streaks */}
          <line x1="30" y1="64" x2="26" y2="76" stroke="url(#rainDrop)" strokeWidth="2" strokeLinecap="round" />
          <line x1="42" y1="64" x2="38" y2="79" stroke="url(#rainDrop)" strokeWidth="2" strokeLinecap="round" />
          <line x1="54" y1="64" x2="50" y2="76" stroke="url(#rainDrop)" strokeWidth="2" strokeLinecap="round" />
          <line x1="66" y1="64" x2="62" y2="78" stroke="url(#rainDrop)" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="80" x2="33" y2="90" stroke="url(#rainDrop)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
          <line x1="48" y1="80" x2="45" y2="90" stroke="url(#rainDrop)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        </svg>
      )}

      {/* 8. Thunderstorm: Electric Glow with Multi-Branched Bolt */}
      {visualType === 'thunderstorm' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="stormCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="boltGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Cloud Base */}
          <path
            d="M 26 56 C 20 56 16 51 16 45 C 16 40 20 36 25 35 C 27 28 34 24 42 24 C 50 24 57 29 59 35 C 61 35 63 35 64 36 C 69 37 73 41 73 46 C 73 51 69 56 64 56 Z"
            fill="url(#stormCloud)"
          />

          {/* Glowing Aura Behind Bolt */}
          <path
            d="M 46 50 L 37 65 L 47 65 L 40 85 L 60 60 L 49 60 Z"
            fill="#c084fc"
            opacity="0.4"
            filter="url(#boltGlow)"
          />

          {/* Multi-tier Lightning Bolt */}
          <path
            d="M 46 50 L 37 65 L 47 65 L 40 85 L 60 60 L 49 60 Z"
            fill="#facc15"
            stroke="#ffffff"
            strokeWidth="0.8"
          />
        </svg>
      )}

      {/* 9. Snow: Frost Cloud with Crystalline Flakes */}
      {visualType === 'snow' && (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="snowCloud" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          <path
            d="M 26 56 C 20 56 16 51 16 45 C 16 40 20 36 25 35 C 27 28 34 24 42 24 C 50 24 57 29 59 35 C 61 35 63 35 64 36 C 69 37 73 41 73 46 C 73 51 69 56 64 56 Z"
            fill="url(#snowCloud)"
          />

          {/* Snowflake 1 */}
          <g transform="translate(32, 68)">
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Snowflake 2 */}
          <g transform="translate(50, 76)">
            <line x1="-6" y1="0" x2="6" y2="0" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="#e0f2fe" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="-4" y1="4" x2="4" y2="-4" stroke="#e0f2fe" strokeWidth="1.3" strokeLinecap="round" />
          </g>

          {/* Snowflake 3 */}
          <g transform="translate(66, 68)">
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#bae6fd" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" />
          </g>
        </svg>
      )}
    </div>
  );
}
