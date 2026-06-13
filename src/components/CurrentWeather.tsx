import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Sparkles,
  Navigation,
  RefreshCw,
  SunDim,
  Heart,
} from "lucide-react";
import { CurrentWeatherDetails, GeoLocation, TempUnit } from "../types";

export interface CurrentWeatherProps {
  city: GeoLocation;
  current: CurrentWeatherDetails;
  tempUnit: TempUnit;
  onToggleUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastFetched: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function getWmoDetails(code: number) {
  switch (code) {
    case 0:
      return { label: "Clear Sky", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" };
    case 1:
      return { label: "Mainly Clear", icon: SunDim, color: "text-amber-400", bg: "bg-amber-400/10" };
    case 2:
      return { label: "Partly Cloudy", icon: CloudSun, color: "text-sky-400", bg: "bg-sky-400/10" };
    case 3:
      return { label: "Overcast", icon: Cloud, color: "text-slate-400", bg: "bg-slate-400/10" };
    case 45:
    case 48:
      return { label: "Foggy", icon: CloudFog, color: "text-neutral-400", bg: "bg-neutral-400/10" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", icon: CloudDrizzle, color: "text-emerald-400", bg: "bg-emerald-400/10" };
    case 56:
    case 57:
      return { label: "Freezing Drizzle", icon: CloudSnow, color: "text-cyan-400", bg: "bg-cyan-400/10" };
    case 61:
    case 63:
    case 65:
      return { label: "Rainy", icon: CloudRain, color: "text-blue-500", bg: "bg-blue-500/10" };
    case 66:
    case 67:
      return { label: "Freezing Rain", icon: CloudSnow, color: "text-teal-400", bg: "bg-teal-400/10" };
    case 71:
    case 73:
    case 75:
      return { label: "Snowfall", icon: CloudSnow, color: "text-sky-300", bg: "bg-sky-300/10" };
    case 77:
      return { label: "Snow Grains", icon: CloudSnow, color: "text-cyan-200", bg: "bg-cyan-200/10" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10" };
    case 85:
    case 86:
      return { label: "Snow Showers", icon: CloudSnow, color: "text-sky-400", bg: "bg-sky-400/10" };
    case 95:
      return { label: "Thunderstorm", icon: CloudLightning, color: "text-violet-500", bg: "bg-violet-500/10" };
    case 96:
    case 99:
      return { label: "Thunderstorm with Hail", icon: CloudLightning, color: "text-purple-500", bg: "bg-purple-500/10" };
    default:
      return { label: "Unknown Conditions", icon: Cloud, color: "text-neutral-400", bg: "bg-neutral-400/10" };
  }
}

export default function CurrentWeather({
  city,
  current,
  tempUnit,
  onToggleUnit,
  onRefresh,
  isRefreshing,
  lastFetched,
  isFavorite,
  onToggleFavorite,
}: CurrentWeatherProps) {
  const { label, icon: WeatherIcon, color: iconColor, bg: iconBg } = getWmoDetails(current.weatherCode);

  const formatTemp = (celsius: number) => {
    if (tempUnit === TempUnit.FAHRENHEIT) {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const getRelativeTimeString = (timestamp: number) => {
    const elapsed = Date.now() - timestamp;
    const mins = Math.floor(elapsed / 60000);
    if (mins < 1) return "Just updated";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
  };

  return (
    <div
      id="current-weather-card"
      className="bg-gradient-to-br from-sky-500 to-blue-700 dark:from-slate-900 dark:to-slate-950 border border-slate-200/20 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative text-white"
    >
      {/* Decorative Blur Bubble */}
      <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span
              id="city-badge"
              className="text-xs font-bold px-3 py-1 bg-white/15 dark:bg-slate-850 text-white dark:text-neutral-200 rounded-full backdrop-blur-sm"
            >
              Current Weather
            </span>
            <span id="country-badge" className="text-xs font-semibold text-sky-100/80 dark:text-slate-400">
              {city.countryCode || city.country}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <h2
              id="current-city-name"
              className="text-4xl font-extrabold text-white dark:text-white tracking-tight"
            >
              {city.name}
            </h2>
            <button
              id="current-weather-favorite-toggle"
              onClick={onToggleFavorite}
              className="text-white hover:text-rose-450 dark:hover:text-rose-400 transition-all hover:scale-115 flex items-center justify-center p-0.5 focus:outline-none cursor-pointer"
              title={isFavorite ? "Remove from favorite cities" : "Add to favorite cities"}
            >
              <Heart
                className={`w-6 h-6 stroke-[2.2] transition-colors ${
                  isFavorite ? "fill-rose-500 text-rose-500" : "text-white/80 hover:text-white"
                }`}
              />
            </button>
          </div>
          {city.admin1 && (
            <p id="city-admin" className="text-sm text-sky-100/70 dark:text-slate-400 font-medium">
              {city.admin1}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto z-10">
          {/* Unit Toggle Button */}
          <button
            id="unit-toggle"
            onClick={onToggleUnit}
            className="flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/25 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-neutral-200 transition-colors font-bold text-sm h-10 w-10 border border-white/10 dark:border-slate-700/50"
            title="Toggle temperature unit"
          >
            {tempUnit === TempUnit.CELSIUS ? "°F" : "°C"}
          </button>

          {/* Refresh Button */}
          <button
            id="refresh-button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/25 dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-neutral-200 transition-colors h-10 w-10 border border-white/10 dark:border-slate-700/50 disabled:opacity-50"
            title="Refresh weather data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
        {/* Main Temperature Display */}
        <div className="flex items-baseline gap-2">
          <span
            id="current-temp"
            className="text-8xl font-black text-white dark:text-white tracking-tighter"
          >
            {formatTemp(current.temperature)}
          </span>
        </div>

        {/* Condition Display */}
        <div className="flex items-center gap-4 border-l border-white/20 dark:border-slate-850 pl-6 py-2">
          <div id="weather-icon-wrapper" className={`p-4 rounded-2xl ${iconBg} ${iconColor} bg-white/10 backdrop-blur-sm`}>
            <WeatherIcon className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div>
            <p id="weather-condition-label" className="text-xl font-extrabold text-white dark:text-slate-100">
              {label}
            </p>
            <p id="day-night-indicator" className="text-xs text-sky-100/60 dark:text-slate-400 capitalize font-medium">
              {current.isDay ? "Daytime" : "Nighttime"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid details */}
      <div
        id="weather-details-grid"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/10 dark:border-slate-800"
      >
        <div
          id="details-apparent"
          className="bg-white/5 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/5 dark:border-slate-800/20 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-sky-100/70 dark:text-slate-400">
            <Thermometer className="w-4 h-4 text-sky-200 dark:text-sky-400" />
            <span className="text-xs font-bold">Feels Like</span>
          </div>
          <p className="text-lg font-black text-white">
            {current.apparentTemperature !== undefined ? formatTemp(current.apparentTemperature) : "N/A"}
          </p>
        </div>

        <div
          id="details-precipitation"
          className="bg-white/5 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/5 dark:border-slate-800/20 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-sky-100/70 dark:text-slate-400">
            <Droplets className="w-4 h-4 text-sky-200 dark:text-sky-400" />
            <span className="text-xs font-bold">Precipitation</span>
          </div>
          <p className="text-lg font-black text-white">
            {current.precipitation !== undefined ? `${current.precipitation} mm` : "0 mm"}
          </p>
        </div>

        <div
          id="details-wind"
          className="bg-white/5 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/5 dark:border-slate-800/20 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-sky-100/70 dark:text-slate-400">
            <Wind className="w-4 h-4 text-sky-200 dark:text-sky-400" />
            <span className="text-xs font-bold">Wind Speed</span>
          </div>
          <p className="text-lg font-black text-white">{current.windSpeed} km/h</p>
        </div>

        <div
          id="details-uv"
          className="bg-white/5 dark:bg-slate-900/40 p-4 rounded-2xl border border-white/5 dark:border-slate-800/20 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1.5 text-sky-100/70 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-sky-200 dark:text-sky-400" />
            <span className="text-xs font-bold">UV Index</span>
          </div>
          <p className="text-lg font-black text-white">{current.uvIndex !== undefined ? current.uvIndex : "0"}</p>
        </div>
      </div>

      {/* Relative Time Stamp */}
      <div
        id="details-timestamp"
        className="mt-6 flex items-center justify-between text-[11px] text-sky-100/50 dark:text-slate-500 font-medium"
      >
        <span>
          Coordinates: {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
        </span>
        <span>{getRelativeTimeString(lastFetched)}</span>
      </div>
    </div>
  );
}
