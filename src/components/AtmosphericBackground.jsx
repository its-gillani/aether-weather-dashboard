import React, { useMemo } from 'react';

/**
 * AtmosphericBackground
 * Deep obsidian-slate canvas (#070B14) with localized radial ambient mesh glows.
 * Replaces the saturated blue flood with refined, macOS/Linear-grade atmospheric depth.
 */
export default function AtmosphericBackground({ backdrop = 'clear-day' }) {
  // Coordinates and colors for soft radial ambient glow blobs
  const moodGlows = useMemo(() => {
    switch (backdrop) {
      case 'clear-night':
      case 'cloudy-night':
        return {
          glow1: 'bg-indigo-950/40',
          glow2: 'bg-purple-950/30',
          glow3: 'bg-slate-900/60',
          stars: true,
        };
      case 'rain':
        return {
          glow1: 'bg-cyan-950/40',
          glow2: 'bg-sky-950/35',
          glow3: 'bg-slate-900/60',
          rain: true,
        };
      case 'thunderstorm':
        return {
          glow1: 'bg-purple-950/45',
          glow2: 'bg-indigo-950/40',
          glow3: 'bg-slate-900/60',
          lightning: true,
        };
      case 'snow':
        return {
          glow1: 'bg-blue-950/35',
          glow2: 'bg-slate-900/50',
          glow3: 'bg-sky-950/25',
          snow: true,
        };
      case 'overcast':
      case 'fog':
        return {
          glow1: 'bg-slate-800/25',
          glow2: 'bg-zinc-900/40',
          glow3: 'bg-slate-900/50',
        };
      case 'clear-day':
      default:
        return {
          glow1: 'bg-sky-900/25',
          glow2: 'bg-blue-950/35',
          glow3: 'bg-indigo-950/20',
        };
    }
  }, [backdrop]);

  // Starlight coordinates for night mode
  const stars = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      top: `${(Math.random() * 85).toFixed(1)}%`,
      left: `${(Math.random() * 96).toFixed(1)}%`,
      size: `${(Math.random() * 1.5 + 1).toFixed(1)}px`,
      opacity: (Math.random() * 0.5 + 0.2).toFixed(2),
      delay: `${(Math.random() * 4).toFixed(1)}s`,
      duration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#070B14] transition-colors duration-1000">
      {/* 1. Subtle Radial Atmospheric Mesh Glows (blur-[120px] opacity-35) */}
      <div
        className={`absolute -top-32 -left-32 w-[580px] h-[580px] rounded-full blur-[140px] opacity-35 transition-all duration-1000 ${moodGlows.glow1}`}
      />
      <div
        className={`absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full blur-[130px] opacity-30 transition-all duration-1000 ${moodGlows.glow2}`}
      />
      <div
        className={`absolute -bottom-24 left-1/3 w-[640px] h-[640px] rounded-full blur-[150px] opacity-25 transition-all duration-1000 ${moodGlows.glow3}`}
      />

      {/* 2. Micro Noise / Fine Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,rgba(7,11,20,0.8)_90%)]" />

      {/* 3. Starlight Particles for Astral Night */}
      {moodGlows.stars && (
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-slate-100 animate-twinkle"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Fine Atmospheric Rain Streaks */}
      {moodGlows.rain && (
        <div className="absolute inset-0 opacity-15 overflow-hidden">
          <div
            className="w-full h-[200%] rain-canvas"
            style={{ animation: 'rain-fall 1.4s linear infinite' }}
          />
        </div>
      )}

      {/* 5. Thunderstorm flash */}
      {moodGlows.lightning && (
        <div className="absolute inset-0 bg-purple-500/[0.04] animate-pulse duration-1000" />
      )}
    </div>
  );
}
