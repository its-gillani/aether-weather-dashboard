# 🌌 Aether — Meteorological Intelligence Dashboard

<div align="center">

![Aether Cover](https://img.shields.io/badge/AETHER-METEOROLOGICAL%20PRECISION-070B14?style=for-the-badge&logo=compass&logoColor=38bdf8)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Free_API_Suite-0284C7?style=flat-square&logo=cloud&logoColor=white)](https://open-meteo.com/)
[![Zero API Keys](https://img.shields.io/badge/API_Keys-Zero_Required-10B981?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<p align="center">
  <b>A bespoke, craft-engineered macOS / Linear-grade meteorological instrument panel.</b><br>
  Real-time high-resolution atmospheric forecasting, multi-tone dynamic vector artwork, and client-side synoptic telemetry powered exclusively by Open-Meteo.
</p>

[Key Features](#-key-features) • [Architecture](#-architectural-highlights) • [Mathematical Engines](#-mathematical--meteorological-engines) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure)

</div>

<img width="1452" height="1201" alt="image" src="https://github.com/user-attachments/assets/9e9f4653-9fd5-4fce-b6d8-3ea559fac0ce" />

---

## 🌟 Key Features

### 1. High-Contrast Obsidian Glass Design System
- **Obsidian Atmospheric Canvas:** Deep `#070B14` viewport with soft, radial ambient mesh glows (`blur-[140px] opacity-35`) shifting between daylight cyan, sunset amber, storm indigo, and night violet.
- **Craft Glassmorphic Surfaces:** Built with `bg-slate-900/65 backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]`.
- **Strict Typographic Hierarchy:** Tabular numerals (`tabular-nums`) across all timestamps, temperatures, and metrics to prevent layout shifts.

### 2. Multi-Tone Vector Weather Artwork
- Replaced scaled generic stroke icons with a dedicated, custom SVG illustration engine (`<WeatherHeroIllustration />`):
  - **Clear Sky:** Radiant sun core with specular arcs and corona rings / Astral crescent moon with ambient aura.
  - **Partly Cloudy:** Layered translucent cloud silhouettes with specular top highlights.
  - **Precipitation & Storms:** Slanted rain streaks, crystalline snowflakes, and electric multi-branched lightning bolts.

### 3. 24-Hour Atmospheric Trajectory (Strict Vertical Lockstep)
- Smooth horizontal scroll container (`overflow-x-auto no-scrollbar`) where each hour occupies an exact `64px` column.
- Plotted Bézier curve nodes, precipitation probability bars, condition icons, rotated wind chevrons, and timestamps share the **exact same X-coordinate** ($x_i$).
- Dashed reference grid lines, subtle area gradient fill, and a vertical gradient guide line highlighting the `"Now"` column.

### 4. Apple Weather-Style 7-Day Synoptic Outlook
- Proportional range bars normalized against the global weekly minimum (`weekMin`) and maximum (`weekMax`).
- Active glowing indicator dot on the "Today" row representing the real-time temperature position within the day's span.
- Interactive day drawers expanding morning, afternoon, evening, and night breakdowns, max UV indices, and wind gusts.

### 5. 6-Card Telemetry Bento Sub-Grid
1. **Air Quality Index (AQI):** Refined `4px` thin-stroke arc with EPA classification, inline status dot, and PM2.5 / PM10 / NO₂ / O₃ breakdown.
2. **Solar Horizon & UV:** Horizon curve with animated celestial orb along the daylight arc, remaining daylight countdown, and UV protection level.
3. **Wind Dynamics & Beaufort Scale:** 360° hairline compass dial with rotating vector needle, sustained velocity, peak gusts, and Beaufort Force 0–12 classification.
4. **Moisture & Comfort:** Relative humidity meter paired with dew point thermal comfort classification (Dry, Comfortable, Sticky, Oppressive).
5. **Barometric Pressure Dial:** Precision semicircular dial with calibrated tick marks at 980, 1000, 1013, 1025, and 1040 hPa, sweeping needle, and 3-hour delta trend detection.
6. **Optical Visibility & Cloud Ceiling:** Line-of-sight range paired with cloud cover percentage gauge and clarity assessment.

### 6. Zero API Keys & Offline Caching
- Seamlessly communicates with Open-Meteo's Geocoding, Forecast, and Air Quality APIs.
- Non-blocking concurrent execution with `Promise.allSettled` and an 8-second `AbortController` timeout.
- 10-minute TTL caching in `localStorage` keyed by rounded station coordinates (`lat.toFixed(2)_lon.toFixed(2)`).

---

## 🔬 Mathematical & Meteorological Engines

### Target City Timezone Alignment
Aether never relies on the viewer's browser timezone. Local clocks, solar horizon arcs, and starting hourly indexes strictly calculate off the target city's `utc_offset_seconds`:

$$\text{TargetEpochMs} = \text{Date.now()} + (\text{utc\_offset\_seconds} \times 1000)$$

### Solar Horizon Quadratic Bézier Curve
The celestial orb $(x, y)$ tracks daylight progress $t \in [0, 1]$ between sunrise ($M_{\text{rise}}$) and sunset ($M_{\text{set}}$):

$$x(t) = (1 - t)^2(20) + 2(1 - t)t(90) + t^2(160)$$
$$y(t) = (1 - t)^2(52) + 2(1 - t)t(2) + t^2(52)$$

### Apple Weather Range Bar Normalization
$$\text{BarLeft}\% = \frac{\text{DayMin}_d - \text{WeekMin}}{\text{WeekMax} - \text{WeekMin}} \times 100\%$$
$$\text{BarWidth}\% = \frac{\text{DayMax}_d - \text{DayMin}_d}{\text{WeekMax} - \text{WeekMin}} \times 100\%$$

### 3-Hour Barometric Synoptic Delta
$$\Delta P = P_{\text{current}} - P_{\text{hour}-3}$$
- $\Delta P \ge +1.5\text{ hPa}$: **Rising Rapidly** $\to$ High pressure ridge approaching; clearing skies.
- $\Delta P \le -1.5\text{ hPa}$: **Falling Rapidly** $\to$ Barometric depression; storms imminent.

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Installation

```bash
# Clone the repository
git clone https://github.com/its-gillani/aether-weather-dashboard.git

# Enter project directory
cd aether-weather-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Compile and optimize production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
aether-weather-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── AtmosphericBackground.jsx    # Deep obsidian canvas & ambient mesh glows
│   │   ├── CachedDataBanner.jsx         # Non-intrusive offline/cache notice
│   │   ├── CommandBar.jsx               # Autocomplete search, GPS, favorites ribbon, units
│   │   ├── DailyForecastCard.jsx        # 7-day outlook with proportional range bars
│   │   ├── ErrorBoundary.jsx            # React error boundary with fallback UI
│   │   ├── HeroCurrentCard.jsx          # Primary temperature readout, local time & insight
│   │   ├── HourlyTimelineCard.jsx       # 24h smooth Bézier curve with vertical lockstep
│   │   ├── TelemetryGrid.jsx            # 2x3 telemetry cards (AQI, Solar, Wind, Comfort, Barometer, Visibility)
│   │   ├── WeatherHeroIllustration.jsx  # Bespoke multi-tone SVG weather artwork
│   │   └── WeatherIcon.jsx              # Vector icon component
│   ├── services/
│   │   └── weatherApi.js                # Open-Meteo client, geocoding & caching layer
│   ├── utils/
│   │   ├── meteorology.js               # Solar arc, Beaufort, dew point, pressure trend calculations
│   │   ├── units.js                     # Instant client-side unit conversions
│   │   └── weatherCodes.js              # WMO code lookups and dynamic theme mapping
│   ├── App.jsx                          # Root layout and reactive state management
│   ├── index.css                        # Tailwind v4 import & custom animations
│   └── main.jsx                         # Application entrypoint
├── package.json
├── vite.config.js
└── README.md
```

---

## ⌨️ Command Shortcuts & Ergonomics

| Action | Control |
| :--- | :--- |
| **Search Stations** | Click search bar or type global station name |
| **Navigate Suggestions** | `ArrowUp` / `ArrowDown` to highlight station |
| **Select Station** | `Enter` |
| **Dismiss Dropdown** | `Escape` |
| **Detect GPS** | Click `Locate GPS` button |
| **Instant Unit Switch** | Click `Units` flyout to toggle °C/°F, km/h/mph/m/s, hPa/inHg, mm/in |
| **Pin / Unpin Station** | Click the `★` icon on any active city |

---

## 📡 API Attribution

Aether is powered by the [Open-Meteo](https://open-meteo.com/) open-source weather API suite:
- **Geocoding API:** Global station resolution and elevation data.
- **Weather Forecast API:** High-resolution meteorological models.
- **Air Quality API:** Atmospheric pollutant concentrations and US AQI indices.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to customize and expand upon it.
