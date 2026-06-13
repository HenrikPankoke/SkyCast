import { Calendar } from "lucide-react";
import { DailyForecast, TempUnit } from "../types";
import { getWmoDetails } from "./CurrentWeather";

interface Forecast7DayProps {
  forecast: DailyForecast[];
  tempUnit: TempUnit;
}

export default function Forecast7Day({ forecast, tempUnit }: Forecast7DayProps) {
  // Find absolute maximum and minimum temperature across the entire week to project the micro bars
  const weeklyTempsMin = forecast.map((f) => f.tempMin);
  const weeklyTempsMax = forecast.map((f) => f.tempMax);
  const minOfWeek = Math.min(...weeklyTempsMin);
  const maxOfWeek = Math.max(...weeklyTempsMax);
  const tempRangeOfWeek = maxOfWeek - minOfWeek || 1; // avoid divide by zero

  const formatTemp = (celsius: number) => {
    if (tempUnit === TempUnit.FAHRENHEIT) {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    const date = new Date(dateStr);
    // Use Intl which is cross-platform safe
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  return (
    <div id="forecast-card" className="bg-white/80 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-6">
        <div id="forecast-header-icon" className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
          <Calendar className="w-5 h-5" />
        </div>
        <h2 id="forecast-header-title" className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          7-Day Forecast
        </h2>
      </div>

      <div id="forecast-list" className="flex flex-col gap-2.5">
        {forecast.map((day, ix) => {
          const { label, icon: DayIcon, color: iconColor } = getWmoDetails(day.weatherCode);

          // Calculate percentage offsets for the custom range track
          const startPercentage = ((day.tempMin - minOfWeek) / tempRangeOfWeek) * 100;
          const endPercentage = ((day.tempMax - minOfWeek) / tempRangeOfWeek) * 100;
          const widthPercentage = endPercentage - startPercentage;

          return (
            <div
              id={`forecast-row-${ix}`}
              key={day.date}
              className="grid grid-cols-[80px_1fr_80px] sm:grid-cols-[100px_45px_1fr_40px_100px_40px] items-center gap-2.5 py-3.5 px-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800/40 rounded-2xl"
            >
              {/* Day title & date */}
              <div className="flex flex-col">
                <span id={`forecast-day-name-${ix}`} className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {getDayName(day.date, ix)}
                </span>
                <span id={`forecast-day-date-${ix}`} className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium whitespace-nowrap">
                  {getFormattedDate(day.date)}
                </span>
              </div>

              {/* Weather icon */}
              <div className={`flex items-center justify-center ${iconColor}`} title={label}>
                <DayIcon className="w-5 h-5 stroke-[2]" />
              </div>

              {/* Weather description label (Hidden on small screens) */}
              <div className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {label}
              </div>

              {/* Temp Min value */}
              <div className="text-right text-xs font-semibold text-slate-400 dark:text-slate-500">
                {formatTemp(day.tempMin)}
              </div>

              {/* Micro-bar visual temperature range (Hidden on very mobile screens) */}
              <div className="hidden sm:flex items-center justify-center px-2">
                <div id={`temp-slider-track-${ix}`} className="relative w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div
                    id={`temp-slider-fill-${ix}`}
                    style={{
                      left: `${startPercentage}%`,
                      width: `${widthPercentage}%`,
                    }}
                    className="absolute h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 dark:from-sky-500 dark:to-teal-400"
                  />
                </div>
              </div>

              {/* Temp Max value */}
              <div className="text-right text-xs font-bold text-neutral-800 dark:text-neutral-100">
                {formatTemp(day.tempMax)}
              </div>
            </div>
          );
        })}
      </div>

      <div id="forecast-footer-info" className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
        Estimated index ranges from seasonal forecast parameters.
      </div>
    </div>
  );
}
